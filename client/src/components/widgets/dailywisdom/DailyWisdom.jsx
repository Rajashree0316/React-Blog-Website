import React, { useEffect, useState } from "react";
import { API } from "../../../config";
import "./DailyWisdom.css";
import Spinner from "../../common/commonSpinner/Spinner";
import { SpinnerTypes } from "../../common/commonSpinner/Spinner";

export default function DailyWisdom() {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        const response = await fetch(`${API}/quote`);

        if (!response.ok) throw new Error("Failed to fetch quote");
        const data = await response.json();
        setQuote({ text: data.text, author: data.author });
      } catch (err) {
        console.error("Quote API error:", err);
        setError("Could not load daily wisdom.");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyQuote();
  }, []);

  return (
    <div className="sideContainer">
      <h3 className="sideContainer-headings">Quote of the Day</h3>
      <hr className="divider" />

      <div className="quote-card">
        <div className="emoji">💡</div>
        {loading ? (
          <Spinner type={SpinnerTypes.HASH} size={50} color="#2563eb" />
        ) : error ? (
          <p className="quote-text">{error}</p>
        ) : (
          <>
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">- {quote.author}</p>
          </>
        )}
      </div>
    </div>
  );
}
