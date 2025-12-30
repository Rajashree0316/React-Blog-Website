import React, { useState, useEffect } from "react";
import "./Contact.css";
import SocialMediaFloat from "../../components/socialmedia/SocialMediaFloat";
import { MdEmail, MdLocationOn, MdAccessTime } from "react-icons/md";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    subscribe: false,
  });

 useEffect(() => {
  try {
    const userData = localStorage.getItem("blogUser");
    if (!userData) return; // If no user, skip pre-fill

    const user = JSON.parse(userData);

    // Optional: add your own isLoggedIn check logic here
    const isUserValid = user?.email && user?.isLoggedIn;

    if (isUserValid) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  } catch (error) {
    console.error("Invalid user data in localStorage");
  }
}, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Enquiry submitted!");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      subscribe: false,
    });
  };

  return (
    <div className="commonContainer">
      <div className="commonHeadings">
        <h2>Get in Touch</h2>
        <p>
          Have a question, suggestion, or just want to say hello? We'd love to
          hear from you!
        </p>
      </div>

      <div className="contact-sub">
        <form className="contact-form headings" onSubmit={handleSubmit}>
          <h2>Send us a Message</h2>

          <div className="nameFieldsInput">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select a Subject</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Feedback">Feedback</option>
              <option value="Partnership">Partnership</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group message-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              maxLength={1000}
              required
            />
            <div className="char-count">
              {formData.message.length}/1000 Characters
            </div>
          </div>

          <button type="submit">Send Message</button>
        </form>

        <div className="contact-wrapper">
          <div className="contact-info  headings">
            <h2>Contact Information</h2>
            <p>We're here to help and answer any questions you might have.</p>

            <div className="info-item">
              <div className="info-item-icons">
                <MdEmail className="icon" />
              </div>
              <div className="info-item-sub">
                <h3>Email</h3>
                <p>hello@blogspace.com</p>
                <p className="muted">We typically respond within 24 hours</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-item-icons">
                <MdLocationOn className="icon" />
              </div>
              <div className="info-item-sub">
                <h3>Location</h3>
                <p>San Francisco, CA</p>
                <p className="muted">Remote-first team</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-item-icons">
                <MdAccessTime className="icon" />
              </div>
              <div className="info-item-sub">
                <h3>Response Time</h3>
                <p>24–48 hours</p>
                <p className="muted">Monday to Friday</p>
              </div>
            </div>

            <div className="social-section">
              <h3>Follow Us:</h3>
              <SocialMediaFloat />
            </div>
          </div>

          <div className="faq-section headings">
            <h2>Frequently Asked Questions</h2>

            <div className="faq-item">
              <h4>How can I contribute to the blog?</h4>

              <p>
                We welcome guest posts! Use the contact form with “Guest Post
                Submission” as the subject and include your article idea.
              </p>
            </div>

            <div className="faq-item">
              <h4>Do you offer technical support?</h4>
              <p>
                Yes! If you’re experiencing issues with our website, reach out
                and we’ll help you.
              </p>
            </div>

            <div className="faq-item">
              <h4>Can I request specific topics?</h4>
              <p>
                Absolutely! We love hearing what our community wants to learn
                about. Send us your topic suggestions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
