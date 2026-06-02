const cron = require('node-cron');
const prisma = require('../config/db');
const { sendEmail } = require('../config/mailer');
const { getIO } = require('../config/socket');

/**
 * Job 1 — Auto-fully-close orders/bookings that have been "closed" for > 48h with no dispute
 * Runs every 15 minutes
 */
cron.schedule('*/15 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Orders
    const orders = await prisma.order.findMany({
      where: { status: 'closed', closedAt: { lt: cutoff } },
      include: { buyer: true, seller: true, listing: { select: { title: true } } },
    });
    for (const order of orders) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'fully_closed', fullyClosedAt: new Date() },
      });
      // Notify both parties
      for (const u of [order.buyer, order.seller]) {
        await prisma.notification.create({
          data: { userId: u.id, type: 'order_fully_closed', title: 'Order completed', body: `Your order for "${order.listing.title}" is fully closed. You can now leave a review.`, metadata: { orderId: order.id } },
        });
        getIO()?.to(`user:${u.id}`).emit('new_notification', { type: 'order_fully_closed', orderId: order.id });
        await sendEmail({ to: u.email, subject: 'Leave a review — onlyStuff', template: 'review_unlocked', vars: { name: u.name, listingTitle: order.listing.title, orderId: order.id, appUrl: process.env.CLIENT_URL } }).catch(() => {});
      }
    }
    if (orders.length) console.log(`[cron] Auto-closed ${orders.length} orders`);

    // Bookings
    const bookings = await prisma.booking.findMany({
      where: { status: 'closed', closedAt: { lt: cutoff } },
    });
    for (const b of bookings) {
      await prisma.booking.update({ where: { id: b.id }, data: { status: 'fully_closed' } });
    }
    if (bookings.length) console.log(`[cron] Auto-closed ${bookings.length} bookings`);
  } catch (e) {
    console.error('[cron] auto-close error:', e.message);
  }
});

/**
 * Job 2 — Auto-cancel expired group buys
 * Runs every 5 minutes
 */
cron.schedule('*/5 * * * *', async () => {
  try {
    const expired = await prisma.groupBuy.findMany({
      where: { status: { in: ['open', 'extended'] }, expiresAt: { lt: new Date() } },
      include: {
        members: { include: { user: true } },
        listing: { select: { title: true } },
      },
    });

    for (const gb of expired) {
      await prisma.groupBuy.update({ where: { id: gb.id }, data: { status: 'cancelled' } });

      // Notify all members
      for (const m of gb.members) {
        await prisma.notification.create({
          data: { userId: m.userId, type: 'groupbuy_cancelled', title: 'Group Buy cancelled', body: `The group buy for "${gb.listing.title}" didn't reach its target and was cancelled.`, metadata: { groupBuyId: gb.id } },
        });
        getIO()?.to(`user:${m.userId}`).emit('new_notification', { type: 'groupbuy_cancelled', groupBuyId: gb.id });
        await sendEmail({ to: m.user.email, subject: 'Group Buy cancelled — onlyStuff', template: 'group_buy_cancelled', vars: { name: m.user.name, listingTitle: gb.listing.title, targetQty: gb.targetQty, listingId: gb.listingId, appUrl: process.env.CLIENT_URL } }).catch(() => {});
      }
    }
    if (expired.length) console.log(`[cron] Cancelled ${expired.length} expired group buys`);
  } catch (e) {
    console.error('[cron] group-buy expiry error:', e.message);
  }
});

/**
 * Job 3 — Warn group buys expiring in the next 6 hours (runs every 30 minutes)
 */
cron.schedule('*/30 * * * *', async () => {
  try {
    const soon = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const warning = new Date(Date.now() + 6.5 * 60 * 60 * 1000);

    const groupBuys = await prisma.groupBuy.findMany({
      where: { status: { in: ['open', 'extended'] }, expiresAt: { gte: new Date(), lte: warning }, warnedAt: null },
      include: { members: { include: { user: true } }, listing: { select: { title: true } } },
    });

    for (const gb of groupBuys) {
      for (const m of gb.members) {
        getIO()?.to(`user:${m.userId}`).emit('groupbuy:expiring_soon', { id: gb.id, expiresAt: gb.expiresAt });
        await sendEmail({ to: m.user.email, subject: 'Group Buy expiring soon — onlyStuff', template: 'group_buy_expiring', vars: { name: m.user.name, listingTitle: gb.listing.title, committedQty: gb.committedQty, targetQty: gb.targetQty, remainingQty: gb.targetQty - gb.committedQty, groupBuyId: gb.id, appUrl: process.env.CLIENT_URL } }).catch(() => {});
      }
    }
    if (groupBuys.length) console.log(`[cron] Warned ${groupBuys.length} expiring group buys`);
  } catch (e) {
    console.error('[cron] group-buy warning error:', e.message);
  }
});

/**
 * Job 4 — Booking reminders 24h before slot (runs every hour)
 */
cron.schedule('0 * * * *', async () => {
  try {
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const in25h = new Date(Date.now() + 25 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: { status: 'confirmed', slotDate: { gte: in24h, lte: in25h } },
      include: {
        buyer: true,
        listing: { include: { seller: true } },
      },
    });

    for (const b of bookings) {
      const slotStr = `${b.slotStart} on ${b.slotDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
      for (const u of [b.buyer, b.listing.seller]) {
        await sendEmail({ to: u.email, subject: 'Booking reminder — onlyStuff', template: 'booking_reminder', vars: { name: u.name, listingTitle: b.listing.title, time: slotStr, appUrl: process.env.CLIENT_URL } }).catch(() => {});
      }
    }
    if (bookings.length) console.log(`[cron] Sent ${bookings.length} booking reminders`);
  } catch (e) {
    console.error('[cron] booking reminder error:', e.message);
  }
});

/**
 * Job 5 — Auto-decline booking requests not responded to in 2 hours (runs every 10 minutes)
 */
cron.schedule('*/10 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const stale = await prisma.booking.findMany({
      where: { status: 'pending', createdAt: { lt: cutoff } },
      include: { buyer: true, listing: { select: { title: true } } },
    });
    for (const b of stale) {
      await prisma.booking.update({ where: { id: b.id }, data: { status: 'declined', cancelReason: 'Auto-declined: no response within 2 hours' } });
      await prisma.notification.create({ data: { userId: b.buyerId, type: 'booking_declined', title: 'Booking declined', body: `Your booking for "${b.listing.title}" was auto-declined (no response).`, metadata: { bookingId: b.id } } });
      getIO()?.to(`user:${b.buyerId}`).emit('new_notification', { type: 'booking_declined', bookingId: b.id });
    }
    if (stale.length) console.log(`[cron] Auto-declined ${stale.length} stale bookings`);
  } catch (e) {
    console.error('[cron] auto-decline error:', e.message);
  }
});

console.log('[cron] All jobs scheduled');
