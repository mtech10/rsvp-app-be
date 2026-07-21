import Notification from "../models/Notification.js";

export async function createNotification({
  user,
  title,
  message,
  type,
  event,
}) {
  return Notification.create({
    user,
    title,
    message,
    type,
    event,
  });
}

export async function notifyOrganizerOfRSVP(event, attendee) {
  return createNotification({
    user: event.host,
    title: "New RSVP Request",
    message: `${attendee.name} requested to join "${event.title}".`,
    type: "rsvp_request",
    event: event._id,
  });
}

export async function notifyOrganizerOfCancellation(event, attendee) {
  return createNotification({
    user: event.host,
    title: "RSVP Cancelled",
    message: `${attendee.name} cancelled their RSVP for "${event.title}".`,
    type: "rsvp_cancelled",
    event: event._id,
  });
}

export async function notifyGuestApproved(event, attendee) {
  return createNotification({
    user: attendee._id,
    title: "RSVP Approved",
    message: `Your RSVP for "${event.title}" has been approved.`,
    type: "rsvp_approved",
    event: event._id,
  });
}

export async function notifyGuestRejected(event, attendee) {
  return createNotification({
    user: attendee._id,
    title: "RSVP Rejected",
    message: `Your RSVP for "${event.title}" was not approved.`,
    type: "rsvp_rejected",
    event: event._id,
  });
}
