import { useState, useEffect, useCallback } from "react";
import { Plus, LogOut, Star, Users, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { contactsApi } from "../services/api";
import { SearchBar } from "./SearchBar";
import { ContactCard, ContactDetail } from "./ContactCard";
import { ContactForm } from "./ContactForm";
import type { Contact, CreateContactData } from "../types";

export function PhoneBook() {
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await contactsApi.getAll({ limit: 100 });
      setContacts(response.data.contacts);
    } catch {
      setError("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    let result = contacts;

    if (showFavoritesOnly) {
      result = result.filter((c) => c.isFavorite);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.company?.toLowerCase().includes(query)
      );
    }

    // Sort alphabetically by first name
    result = [...result].sort((a, b) => a.firstName.localeCompare(b.firstName));

    setFilteredContacts(result);
  }, [contacts, searchQuery, showFavoritesOnly]);

  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const letter = contact.firstName[0].toUpperCase();
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(contact);
    return groups;
  }, {} as Record<string, Contact[]>);

  const handleCreateContact = async (data: CreateContactData) => {
    const response = await contactsApi.create(data);
    setContacts((prev) => [...prev, response.data.contact]);
  };

  const handleUpdateContact = async (data: CreateContactData) => {
    if (!editingContact) return;
    const response = await contactsApi.update(editingContact._id, data);
    setContacts((prev) =>
      prev.map((c) =>
        c._id === editingContact._id ? response.data.contact : c
      )
    );
    if (selectedContact?._id === editingContact._id) {
      setSelectedContact(response.data.contact);
    }
    setEditingContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    await contactsApi.delete(id);
    setContacts((prev) => prev.filter((c) => c._id !== id));
    if (selectedContact?._id === id) {
      setSelectedContact(null);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const response = await contactsApi.toggleFavorite(id);
    setContacts((prev) =>
      prev.map((c) => (c._id === id ? response.data.contact : c))
    );
    if (selectedContact?._id === id) {
      setSelectedContact(response.data.contact);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore logout errors
    }
  };

  return (
    <div className="phonebook">
      <header className="phonebook-header">
        <div className="header-left">
          <h1>Phone Book</h1>
          <span className="user-greeting">Hello, {user?.fullName}</span>
        </div>
        <button
          className="btn-icon logout"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="phonebook-content">
        <aside
          className={`contact-list-panel ${
            selectedContact ? "hidden-mobile" : ""
          }`}
        >
          <div className="list-header">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="filter-buttons">
              <button
                className={`filter-btn ${!showFavoritesOnly ? "active" : ""}`}
                onClick={() => setShowFavoritesOnly(false)}
              >
                <Users size={18} />
                All
              </button>
              <button
                className={`filter-btn ${showFavoritesOnly ? "active" : ""}`}
                onClick={() => setShowFavoritesOnly(true)}
              >
                <Star size={18} />
                Favorites
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={32} />
              <p>Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={fetchContacts}>
                Retry
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>{searchQuery ? "No contacts found" : "No contacts yet"}</h3>
              <p>
                {searchQuery
                  ? "Try a different search term"
                  : "Add your first contact to get started"}
              </p>
            </div>
          ) : (
            <div className="contact-list">
              {Object.keys(groupedContacts)
                .sort()
                .map((letter) => (
                  <div key={letter} className="contact-group">
                    <div className="group-header">{letter}</div>
                    {groupedContacts[letter].map((contact) => (
                      <ContactCard
                        key={contact._id}
                        contact={contact}
                        onEdit={(c) => {
                          setEditingContact(c);
                          setShowForm(true);
                        }}
                        onDelete={handleDeleteContact}
                        onToggleFavorite={handleToggleFavorite}
                        onSelect={setSelectedContact}
                        isSelected={selectedContact?._id === contact._id}
                      />
                    ))}
                  </div>
                ))}
            </div>
          )}

          <button
            className="fab"
            onClick={() => {
              setEditingContact(null);
              setShowForm(true);
            }}
            aria-label="Add contact"
          >
            <Plus size={28} />
          </button>
        </aside>

        <main
          className={`contact-detail-panel ${selectedContact ? "visible" : ""}`}
        >
          {selectedContact ? (
            <ContactDetail
              contact={selectedContact}
              onClose={() => setSelectedContact(null)}
              onEdit={(c) => {
                setEditingContact(c);
                setShowForm(true);
              }}
              onDelete={handleDeleteContact}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <div className="no-selection">
              <Users size={64} />
              <h2>Select a contact</h2>
              <p>Choose a contact from the list to view details</p>
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <ContactForm
          contact={editingContact}
          onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
          onClose={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
}
