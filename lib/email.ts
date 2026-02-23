import nodemailer from "nodemailer";
import type { Order } from "@/types";
import { SITE_NAME, SITE_EMAIL, WHATSAPP_NUMBER, SITE_URL } from "@/lib/constants";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL || SITE_EMAIL,
    pass: process.env.SMTP_PASSWORD, // Gmail App Password
  },
});

function formatItemsHtml(order: Order): string {
  return order.items
    .map(
      (i) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0f7; font-size: 14px; color: #1a1a2e;">
          ${i.product.name}
          ${i.variant ? `<span style="color: #999; font-size: 12px;"> (${i.variant.name})</span>` : ""}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0f7; text-align: center; font-size: 14px; color: #666;">
          ${i.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0f7; text-align: right; font-size: 14px; color: #666;">
          ₦${(i.variant?.price || i.product.price).toLocaleString()}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f0f7; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a2e;">
          ₦${((i.variant?.price || i.product.price) * i.quantity).toLocaleString()}
        </td>
      </tr>`
    )
    .join("");
}

function buildReceiptHtml(order: Order): string {
  const a = order.shippingAddress;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; font-size: 28px; letter-spacing: 4px; margin: 0 0 4px 0;">${SITE_NAME}</h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Order Receipt</p>
    </div>

    <!-- Order Info -->
    <div style="background: white; padding: 32px; border-left: 1px solid #f3f0f7; border-right: 1px solid #f3f0f7;">
      
      <!-- Greeting -->
      <p style="font-size: 16px; color: #1a1a2e; margin: 0 0 4px 0;">Hi ${a.firstName},</p>
      <p style="font-size: 14px; color: #888; margin: 0 0 24px 0;">Thank you for your order! Here's your receipt.</p>

      <!-- Order ID & Date -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
        <div>
          <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 4px 0;">Order</p>
          <p style="font-size: 13px; font-family: monospace; color: #1a1a2e; background: #f8f7fa; padding: 4px 10px; border-radius: 20px; display: inline-block; margin: 0;">${order.id}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 4px 0;">Date</p>
          <p style="font-size: 13px; color: #666; margin: 0;">${date}</p>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #f3f0f7;">
            <th style="text-align: left; padding: 8px 0; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px;">Product</th>
            <th style="text-align: center; padding: 8px 0; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px;">Qty</th>
            <th style="text-align: right; padding: 8px 0; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px;">Price</th>
            <th style="text-align: right; padding: 8px 0; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${formatItemsHtml(order)}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top: 1px solid #f3f0f7; padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 14px; color: #888;">Subtotal</span>
          <span style="font-size: 14px; color: #666;">₦${order.subtotal.toLocaleString()}</span>
        </div>
        ${order.discountTotal ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 14px; color: #10b981;">Discount${order.couponCode ? ` (${order.couponCode})` : ""}</span>
          <span style="font-size: 14px; color: #10b981;">-₦${order.discountTotal.toLocaleString()}</span>
        </div>` : ""}
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="font-size: 14px; color: #888;">Shipping</span>
          <span style="font-size: 14px; color: #666;">${order.shipping === 0 ? "Free" : `₦${order.shipping.toLocaleString()}`}</span>
        </div>
        <div style="border-top: 1px solid #f3f0f7; padding-top: 12px; display: flex; justify-content: space-between;">
          <span style="font-size: 16px; font-weight: 700; color: #1a1a2e;">Total</span>
          <span style="font-size: 20px; font-weight: 700; color: #1a1a2e;">₦${order.total.toLocaleString()}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <div style="margin-top: 24px; padding: 20px; background: #f8f7fa; border-radius: 12px;">
        <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">Shipping To</p>
        <p style="font-size: 14px; color: #1a1a2e; margin: 0 0 2px 0; font-weight: 500;">${order.customerName}</p>
        <p style="font-size: 13px; color: #666; margin: 0 0 2px 0;">${a.address}</p>
        <p style="font-size: 13px; color: #666; margin: 0 0 2px 0;">${a.city}, ${a.state} ${a.zip}</p>
        <p style="font-size: 13px; color: #666; margin: 0;">${a.country}</p>
      </div>

      ${order.paymentMethod === "bank_transfer" ? `
      <!-- Payment Notice -->
      <div style="margin-top: 16px; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;">
        <p style="font-size: 13px; color: #92400e; margin: 0; font-weight: 500;">⏳ Payment Pending</p>
        <p style="font-size: 12px; color: #a16207; margin: 4px 0 0 0;">Please complete your bank transfer to process this order.</p>
      </div>` : ""}
    </div>

    <!-- Footer -->
    <div style="background: #f8f7fa; border-radius: 0 0 16px 16px; padding: 24px; text-align: center; border: 1px solid #f3f0f7; border-top: none;">
      <a href="${SITE_URL}/track?id=${order.id}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%); color: white; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 25px; margin-bottom: 12px;">📦 Track Your Order →</a>
      <br>
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I have a question about my order.")}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-bottom: 12px;">💬 Chat with us on WhatsApp</a>
      <p style="font-size: 12px; color: #aaa; margin: 0 0 4px 0;">
        We'll send you tracking info once your order ships.
      </p>
      <p style="font-size: 12px; color: #ccc; margin: 0;">
        With love, The ${SITE_NAME} Team
      </p>
    </div>

  </div>
</body>
</html>`;
}

function buildAdminNotificationHtml(order: Order): string {
  const a = order.shippingAddress;
  const paymentInfo = order.paymentMethod === "bank_transfer"
    ? `<p style="color: #2563eb; font-weight: 600;">💳 Payment Method: Bank Transfer (Awaiting Payment)</p>`
    : `<p style="color: #16a34a; font-weight: 600;">💬 Payment Method: WhatsApp</p>`;

  return `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8f7fa;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: #1a1a2e; padding: 20px; color: white;">
      <h2 style="margin: 0; font-size: 16px;">🛍️ New Order: ${order.id}</h2>
      <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.6;">${new Date(order.createdAt).toLocaleString()}</p>
    </div>
    <div style="padding: 20px; font-size: 14px; color: #333;">
      ${paymentInfo}
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Address:</strong> ${a.address}, ${a.city}, ${a.state} ${a.zip}, ${a.country}</p>
      <hr style="border: none; border-top: 1px solid #f3f0f7; margin: 16px 0;">
      <p><strong>Items:</strong></p>
      <ul style="padding-left: 20px;">
        ${order.items.map(i => `<li>${i.product.name} ×${i.quantity} — ₦${((i.variant?.price || i.product.price) * i.quantity).toLocaleString()}</li>`).join("")}
      </ul>
      <hr style="border: none; border-top: 1px solid #f3f0f7; margin: 16px 0;">
      <p><strong>Total: ₦${order.total.toLocaleString()}</strong></p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderEmails(order: Order): Promise<void> {
  // Skip if SMTP is not configured
  if (!process.env.SMTP_PASSWORD) {
    console.log("⚠️  SMTP_PASSWORD not set — skipping email send. Emails logged to console instead.");
    return;
  }

  try {
    // Send customer receipt
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_EMAIL || SITE_EMAIL}>`,
      to: order.email,
      subject: `Your ${SITE_NAME} Order Receipt — ${order.id}`,
      html: buildReceiptHtml(order),
    });
    console.log(`✅ Customer receipt sent to ${order.email}`);

    // Send admin notification
    await transporter.sendMail({
      from: `"${SITE_NAME} Orders" <${process.env.SMTP_EMAIL || SITE_EMAIL}>`,
      to: SITE_EMAIL,
      subject: `🛍️ New Order: ${order.id} — ₦${order.total.toLocaleString()}`,
      html: buildAdminNotificationHtml(order),
    });
    console.log(`✅ Admin notification sent to ${SITE_EMAIL}`);
  } catch (error) {
    console.error("❌ Email send failed:", error);
  }
}

// ── Payment Approved Email ──
export async function sendPaymentApprovedEmail(order: Order): Promise<void> {
  if (!process.env.SMTP_PASSWORD) return;

  const firstName = order.shippingAddress?.firstName || order.customerName.split(" ")[0];

  const html = buildStatusEmailHtml({
    firstName,
    orderId: order.id,
    total: order.total,
    emoji: "✅",
    title: "Payment Confirmed!",
    accentColor: "#10b981",
    accentBg: "#ecfdf5",
    message: "Great news! Your payment has been verified and confirmed. We're now preparing your order for shipment.",
    statusLabel: "Payment Confirmed",
    nextStep: "We'll notify you once your order has been shipped.",
  });

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_EMAIL || SITE_EMAIL}>`,
      to: order.email,
      subject: `✅ Payment Confirmed — ${order.id} | ${SITE_NAME}`,
      html,
    });
    console.log(`✅ Payment approved email sent to ${order.email}`);
  } catch (error) {
    console.error("❌ Payment approved email failed:", error);
  }
}

// ── Order Shipped Email ──
export async function sendOrderShippedEmail(order: Order): Promise<void> {
  if (!process.env.SMTP_PASSWORD) return;

  const firstName = order.shippingAddress?.firstName || order.customerName.split(" ")[0];
  const a = order.shippingAddress;

  const html = buildStatusEmailHtml({
    firstName,
    orderId: order.id,
    total: order.total,
    emoji: "📦",
    title: "Your Order Has Been Shipped!",
    accentColor: "#3b82f6",
    accentBg: "#eff6ff",
    message: "Your order is on its way! It has been packed with care and handed over to our delivery partner.",
    statusLabel: "Shipped",
    nextStep: `Your package is heading to: ${a.address}, ${a.city}, ${a.state}. We'll let you know once it's delivered.`,
  });

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_EMAIL || SITE_EMAIL}>`,
      to: order.email,
      subject: `📦 Your Order Has Shipped — ${order.id} | ${SITE_NAME}`,
      html,
    });
    console.log(`✅ Order shipped email sent to ${order.email}`);
  } catch (error) {
    console.error("❌ Shipped email failed:", error);
  }
}

// ── Order Delivered Email ──
export async function sendOrderDeliveredEmail(order: Order): Promise<void> {
  if (!process.env.SMTP_PASSWORD) return;

  const firstName = order.shippingAddress?.firstName || order.customerName.split(" ")[0];

  const html = buildStatusEmailHtml({
    firstName,
    orderId: order.id,
    total: order.total,
    emoji: "🎉",
    title: "Your Order Has Been Delivered!",
    accentColor: "#7c3aed",
    accentBg: "#f5f3ff",
    message: "Your order has been successfully delivered! We hope you love your new items.",
    statusLabel: "Delivered",
    nextStep: "If you have any questions about your order, don't hesitate to reach out. Thank you for shopping with us! 💜",
  });

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_EMAIL || SITE_EMAIL}>`,
      to: order.email,
      subject: `🎉 Order Delivered — ${order.id} | ${SITE_NAME}`,
      html,
    });
    console.log(`✅ Order delivered email sent to ${order.email}`);
  } catch (error) {
    console.error("❌ Delivered email failed:", error);
  }
}

// ── Shared Status Email Template ──
function buildStatusEmailHtml(params: {
  firstName: string;
  orderId: string;
  total: number;
  emoji: string;
  title: string;
  accentColor: string;
  accentBg: string;
  message: string;
  statusLabel: string;
  nextStep: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; font-size: 28px; letter-spacing: 4px; margin: 0 0 4px 0;">${SITE_NAME}</h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Order Update</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-left: 1px solid #f3f0f7; border-right: 1px solid #f3f0f7;">
      
      <!-- Status Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; font-size: 32px; background: ${params.accentBg}; border-radius: 50%; text-align: center;">
          ${params.emoji}
        </div>
      </div>

      <h2 style="font-size: 22px; color: #1a1a2e; text-align: center; margin: 0 0 8px 0;">${params.title}</h2>
      
      <p style="font-size: 14px; color: #1a1a2e; margin: 0 0 4px 0;">Hi ${params.firstName},</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 20px 0; line-height: 1.6;">${params.message}</p>

      <!-- Order Info Card -->
      <div style="background: #f8f7fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 4px 0;">Order</p>
            <p style="font-size: 13px; font-family: monospace; color: #1a1a2e; margin: 0;">${params.orderId}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 4px 0;">Total</p>
            <p style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0;">₦${params.total.toLocaleString()}</p>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
          <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 4px 0;">Status</p>
          <span style="display: inline-block; font-size: 12px; font-weight: 600; color: ${params.accentColor}; background: ${params.accentBg}; padding: 4px 12px; border-radius: 20px;">
            ${params.statusLabel}
          </span>
        </div>
      </div>

      <p style="font-size: 13px; color: #888; line-height: 1.6; margin: 0;">${params.nextStep}</p>
    </div>

    <!-- Footer -->
    <div style="background: #f8f7fa; border-radius: 0 0 16px 16px; padding: 24px; text-align: center; border: 1px solid #f3f0f7; border-top: none;">
      <a href="${SITE_URL}/track?id=${params.orderId}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%); color: white; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 25px; margin-bottom: 12px;">📦 Track Your Order →</a>
      <br>
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I have a question about my order.")}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-bottom: 12px;">💬 Chat with us on WhatsApp</a>
      <p style="font-size: 12px; color: #ccc; margin: 0;">
        With love, The ${SITE_NAME} Team
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Review Request Email (sent days after delivery) ──
export async function sendReviewRequestEmail(order: Order): Promise<void> {
  if (!process.env.SMTP_PASSWORD) return;

  const firstName = order.shippingAddress?.firstName || order.customerName.split(" ")[0];
  const itemNames = order.items.map(i => i.product.name).join(", ");
  const reorderMessage = encodeURIComponent(
    `Hi! I'd like to reorder from my previous order *${order.id}*. Same items please!\n\nItems: ${itemNames}`
  );

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; font-size: 28px; letter-spacing: 4px; margin: 0 0 4px 0;">${SITE_NAME}</h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">We'd Love Your Feedback</p>
    </div>

    <div style="background: white; padding: 32px; border-left: 1px solid #f3f0f7; border-right: 1px solid #f3f0f7;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; font-size: 32px; background: #fef3c7; border-radius: 50%; text-align: center;">⭐</div>
      </div>

      <h2 style="font-size: 22px; color: #1a1a2e; text-align: center; margin: 0 0 16px 0;">How Was Your Experience?</h2>

      <p style="font-size: 14px; color: #1a1a2e; margin: 0 0 4px 0;">Hi ${firstName},</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 20px 0; line-height: 1.6;">We hope you're loving your recent order! Your feedback helps us serve you better. Let us know how everything went — we'd truly appreciate it. 💜</p>

      <div style="background: #f8f7fa; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">Your Items</p>
        <p style="font-size: 14px; color: #1a1a2e; margin: 0;">${itemNames}</p>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center;">
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I just received my order *${order.id}* and I wanted to share some feedback: `)}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 25px; margin-bottom: 12px;">💬 Share Feedback on WhatsApp</a>
        <br>
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${reorderMessage}" style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 25px;">🔄 Reorder on WhatsApp</a>
      </div>
    </div>

    <div style="background: #f8f7fa; border-radius: 0 0 16px 16px; padding: 24px; text-align: center; border: 1px solid #f3f0f7; border-top: none;">
      <p style="font-size: 12px; color: #ccc; margin: 0;">With love, The ${SITE_NAME} Team</p>
    </div>

  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_EMAIL || SITE_EMAIL}>`,
      to: order.email,
      subject: `⭐ How Was Your Order? — ${SITE_NAME}`,
      html,
    });
    console.log(`✅ Review request email sent to ${order.email}`);
  } catch (error) {
    console.error("❌ Review request email failed:", error);
  }
}

// ── Abandoned Cart Email ──
export async function sendAbandonedCartEmail(
  email: string,
  firstName: string,
  items: { name: string; price: number }[]
): Promise<void> {
  if (!process.env.SMTP_PASSWORD) return;

  const itemList = items.map(i => `<li style="padding: 6px 0; font-size: 14px; color: #333;">${i.name} — ₦${i.price.toLocaleString()}</li>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; font-size: 28px; letter-spacing: 4px; margin: 0 0 4px 0;">${SITE_NAME}</h1>
      <p style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">You Left Something Behind</p>
    </div>

    <div style="background: white; padding: 32px; border-left: 1px solid #f3f0f7; border-right: 1px solid #f3f0f7;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; font-size: 32px; background: #fef2f2; border-radius: 50%; text-align: center;">🛒</div>
      </div>

      <h2 style="font-size: 22px; color: #1a1a2e; text-align: center; margin: 0 0 16px 0;">Complete Your Purchase</h2>

      <p style="font-size: 14px; color: #1a1a2e; margin: 0 0 4px 0;">Hi ${firstName},</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 20px 0; line-height: 1.6;">We noticed you left some beautiful items in your cart. They're still waiting for you! 💜</p>

      <div style="background: #f8f7fa; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">Your Items</p>
        <ul style="padding-left: 20px; margin: 0;">${itemList}</ul>
      </div>

      <div style="text-align: center;">
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I was shopping on your store and I'd like to complete my order. Here are the items I'm interested in: ${items.map(i => i.name).join(", ")}`)}" style="display: inline-block; background: #25D366; color: white; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 25px; margin-bottom: 12px;">💬 Complete Order on WhatsApp</a>
      </div>
    </div>

    <div style="background: #f8f7fa; border-radius: 0 0 16px 16px; padding: 24px; text-align: center; border: 1px solid #f3f0f7; border-top: none;">
      <p style="font-size: 12px; color: #ccc; margin: 0;">With love, The ${SITE_NAME} Team</p>
    </div>

  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_EMAIL || SITE_EMAIL}>`,
      to: email,
      subject: `🛒 You Left Something Behind — ${SITE_NAME}`,
      html,
    });
    console.log(`✅ Abandoned cart email sent to ${email}`);
  } catch (error) {
    console.error("❌ Abandoned cart email failed:", error);
  }
}
