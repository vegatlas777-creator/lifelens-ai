import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
    const WEBHOOK_PUBLIC_KEY = Deno.env.get("WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");
    if (!WEBHOOK_PUBLIC_KEY) {
      console.error("Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");
      return Response.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const requestBody = await req.text();

    // Step 1: Verify JWT signature — fail closed
    let rawPayload;
    try {
      rawPayload = jwt.verify(requestBody, WEBHOOK_PUBLIC_KEY, { algorithms: ["RS256"] });
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Step 2: Parse double-nested JSON
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    const base44 = createClientFromRequest(req);

    if (event.eventType === "wix.ecom.v1.order_approved") {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;

      // Extract subscription IDs from line items
      let subscriptionId = null;
      for (const lineItem of order.lineItems) {
        if (lineItem.subscriptionInfo) {
          subscriptionId = lineItem.subscriptionInfo.id;
          break;
        }
      }

      // Match by wix_checkout_id (stored on checkout creation)
      const pendingSubs = await base44.asServiceRole.entities.Subscription.filter({ wix_checkout_id: checkoutId, status: "pending" });
      if (pendingSubs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(pendingSubs[0].id, {
          status: "active",
          wix_subscription_id: subscriptionId,
        });
      }

      console.log(`Order approved: checkoutId=${checkoutId}, subscriptionId=${subscriptionId}`);

    } else if (
      event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_canceled" ||
      event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_expired"
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;

      // Find subscription by wix_subscription_id and mark as canceled/expired
      const subs = await base44.asServiceRole.entities.Subscription.filter({ wix_subscription_id: subscriptionId });
      if (subs.length > 0) {
        const newStatus = event.eventType.includes("canceled") ? "canceled" : "expired";
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: newStatus,
          plan: "free",
        });
      }

      console.log(`Subscription ${event.eventType.includes("canceled") ? "canceled" : "expired"}: subscriptionId=${subscriptionId}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});