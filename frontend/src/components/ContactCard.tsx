import { Phone, Mail, Building2, Star, Trash2, Edit3 } from "lucide-react";
import type { Contact } from "../types";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelect: (contact: Contact) => void;
  isSelected?: boolean;
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelect,
  isSelected,
}: ContactCardProps) {
  const initials =
    `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  return (
    <div
      className={`contact-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(contact)}
    >
      <div
        className="contact-avatar"
        style={{ backgroundColor: getAvatarColor(contact.firstName) }}
      >
        {initials}
      </div>

      <div className="contact-info">
        <h3 className="contact-name">{contact.fullName}</h3>
        {contact.company && (
          <p className="contact-company">
            <Building2 size={14} />
            {contact.company}
          </p>
        )}
      </div>

      <div className="contact-actions">
        <button
          className={`btn-icon ${contact.isFavorite ? "favorite" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(contact._id);
          }}
          aria-label={
            contact.isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Star size={18} fill={contact.isFavorite ? "currentColor" : "none"} />
        </button>
        <button
          className="btn-icon edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(contact);
          }}
          aria-label="Edit contact"
        >
          <Edit3 size={18} />
        </button>
        <button
          className="btn-icon delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(contact._id);
          }}
          aria-label="Delete contact"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

interface ContactDetailProps {
  contact: Contact;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function ContactDetail({
  contact,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}: ContactDetailProps) {
  const initials =
    `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  return (
    <div className="contact-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={onClose}>
          ← Back
        </button>
        <div className="detail-actions">
          <button
            className={`btn-icon ${contact.isFavorite ? "favorite" : ""}`}
            onClick={() => onToggleFavorite(contact._id)}
          >
            <Star
              size={20}
              fill={contact.isFavorite ? "currentColor" : "none"}
            />
          </button>
          <button className="btn-icon edit" onClick={() => onEdit(contact)}>
            <Edit3 size={20} />
          </button>
          <button
            className="btn-icon delete"
            onClick={() => onDelete(contact._id)}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="detail-profile">
        <div
          className="detail-avatar"
          style={{ backgroundColor: getAvatarColor(contact.firstName) }}
        >
          {initials}
        </div>
        <h2>{contact.fullName}</h2>
        {contact.jobTitle && <p className="job-title">{contact.jobTitle}</p>}
        {contact.company && <p className="company">{contact.company}</p>}
      </div>

      <div className="detail-info">
        <div className="info-section">
          <a href={`tel:${contact.phone}`} className="info-item clickable">
            <div className="info-icon phone">
              <Phone size={20} />
            </div>
            <div className="info-content">
              <span className="info-label">Phone</span>
              <span className="info-value">{contact.phone}</span>
            </div>
          </a>

          <a href={`mailto:${contact.email}`} className="info-item clickable">
            <div className="info-icon email">
              <Mail size={20} />
            </div>
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{contact.email}</span>
            </div>
          </a>
        </div>

        {contact.address &&
          (contact.address.street || contact.address.city) && (
            <div className="info-section">
              <div className="info-item">
                <div className="info-content">
                  <span className="info-label">Address</span>
                  <span className="info-value">
                    {[
                      contact.address.street,
                      contact.address.city,
                      contact.address.state,
                      contact.address.zipCode,
                      contact.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>
          )}

        {contact.notes && (
          <div className="info-section">
            <div className="info-item">
              <div className="info-content">
                <span className="info-label">Notes</span>
                <span className="info-value notes">{contact.notes}</span>
              </div>
            </div>
          </div>
        )}

        {contact.tags && contact.tags.length > 0 && (
          <div className="info-section">
            <div className="tags-container">
              {contact.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
