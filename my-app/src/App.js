import React, { useState } from "react";
import "./App.css"; // Import custom styles
import Select from "react-select";

const suits = ["h", "d", "c", "s"]; // Suits: hearts, diamonds, clubs, spades
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]; // Ranks: 2 to A

const handStrengthOptions = [
  { value: "SELECT_ALL", label: "Select All" },
  { value: "STRAIGHT_FLUSH", label: "STRAIGHT_FLUSH" },
  { value: "FOUR_OF_A_KIND", label: "FOUR_OF_A_KIND" },
  { value: "FULL_HOUSE", label: "FULL_HOUSE" },
  { value: "FLUSH", label: "FLUSH" },
  { value: "STRAIGHT", label: "STRAIGHT" },
  { value: "THREE_OF_A_KIND", label: "THREE_OF_A_KIND" },
  { value: "TWO_PAIR", label: "TWO_PAIR" },
  { value: "TWO_PAIR_OVER_PAIR", label: "TWO_PAIR_OVER_PAIR" },
  { value: "TWO_PAIR_TOP_PAIR", label: "TWO_PAIR_TOP_PAIR" },
  { value: "OVER_PAIR", label: "OVER_PAIR" },
  { value: "TOP_PAIR", label: "TOP_PAIR" },
  { value: "SECOND_OVER_PAIR", label: "SECOND_OVER_PAIR" },
  { value: "SECOND_TOP_PAIR", label: "SECOND_TOP_PAIR" },
  { value: "THIRD_OVER_PAIR", label: "THIRD_OVER_PAIR" },
  { value: "THIRD_TOP_PAIR", label: "THIRD_TOP_PAIR" },
  { value: "ACE_HIGH", label: "ACE_HIGH" },
  { value: "KING_HIGH", label: "KING_HIGH" },
  { value: "TWO_OVER_CARD", label: "TWO_OVER_CARD" },
  { value: "OVER_CARD", label: "OVER_CARD" },
  { value: "FLUSH_DRAW_ONE_CARD", label: "FLUSH_DRAW_ONE_CARD" },
  { value: "FLUSH_DRAW_TWO_CARD", label: "FLUSH_DRAW_TWO_CARD" },
  { value: "STRAIGHT_DRAW", label: "STRAIGHT_DRAW" },
  { value: "GUTSHOT", label: "GUTSHOT" },
];

const App = () => {
  const [selectedFlop, setSelectedFlop] = useState(["", "", ""]);
  const [selectedTurn, setSelectedTurn] = useState("");
  const [selectedRiver, setSelectedRiver] = useState("");
  const [selectedDead, setSelectedDead] = useState([]);
  const [ranges, setRanges] = useState("");
  const [selectedHandStrengths, setSelectedHandStrengths] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [currentSelection, setCurrentSelection] = useState("flop");

  const handleCardClick = (card) => {
    if (
      selectedFlop.includes(card) ||
      selectedTurn === card ||
      selectedRiver === card ||
      selectedDead.includes(card)
    ) {
      alert("Card already selected! Please choose a different card.");
      return;
    }

    if (currentSelection === "flop") {
      const nextFlopIndex = selectedFlop.findIndex((c) => c === "");
      if (nextFlopIndex !== -1) {
        const newFlop = [...selectedFlop];
        newFlop[nextFlopIndex] = card;
        setSelectedFlop(newFlop);
      }
    } else if (currentSelection === "turn") {
      setSelectedTurn(card);
    } else if (currentSelection === "river") {
      setSelectedRiver(card);
    } else if (currentSelection === "dead") {
      setSelectedDead([...selectedDead, card]);
    }
  };

  const clearCard = (position) => {
    if (position === "flop") {
      setSelectedFlop(["", "", ""]);
    } else if (position === "turn") {
      setSelectedTurn("");
    } else if (position === "river") {
      setSelectedRiver("");
    } else if (position === "dead") {
      setSelectedDead([]);
    }
  };

  const handleHandStrengthsChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "SELECT_ALL")) {
      setSelectedHandStrengths(
        handStrengthOptions.filter((option) => option.value !== "SELECT_ALL")
      );
    } else {
      setSelectedHandStrengths(selectedOptions || []);
    }
  };

  const renderCardGrid = () => {
    return suits.map((suit, rowIndex) => (
      <div key={rowIndex} className="card-row">
        {ranks.map((rank, colIndex) => {
          const card = `${rank}${suit}`;
          const isSelected =
            selectedFlop.includes(card) ||
            selectedTurn === card ||
            selectedRiver === card ||
            selectedDead.includes(card);

          return (
            <div
              key={colIndex}
              className={`card ${isSelected ? "selected" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              <img
                src={`/images/cards/${card}.png`}
                alt={card}
                className="card-icon"
              />
            </div>
          );
        })}
      </div>
    ));
  };

  const handleSubmit = async () => {
    const payload = {
      flop: selectedFlop.filter((card) => card !== "").join(","),
      ...(selectedTurn && { turn: selectedTurn }),
      ...(selectedRiver && { river: selectedRiver }),
      dead: selectedDead.join(","),
      ranges,
      handStrengths: selectedHandStrengths.map((option) => option.value),
    };

    try {
      const response = await fetch("http://localhost:10011/rank-counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setResponseData(result);
      setError(null);
    } catch (error) {
      console.error("Error during fetch:", error);
      setError(error.message);
      setResponseData(null);
    }
  };

  const renderCounts = (counts) => {
    return Object.entries(counts).map(([key, value]) => (
      <div key={key} className="count-item">
        <strong>{key}:</strong> {value}
      </div>
    ));
  };

  const renderHands = (hands) => {
    return Object.entries(hands).map(([key, value]) => (
      <div key={key} className="hands-section">
        <h4>{key}</h4>
        <div className="hands-list">
          {value.map((hand, index) => (
            <span key={index} className="hand-item">
              {hand}
            </span>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="container mt-5">


      <div className="selection-buttons mb-4">
        <button
          className={`btn ${
            currentSelection === "flop" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setCurrentSelection("flop")}
        >
          Select Flop
        </button>
        <button
          className={`btn ${
            currentSelection === "turn" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setCurrentSelection("turn")}
        >
          Select Turn
        </button>
        <button
          className={`btn ${
            currentSelection === "river" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setCurrentSelection("river")}
        >
          Select River
        </button>
        <button
          className={`btn ${
            currentSelection === "dead" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setCurrentSelection("dead")}
        >
          Select Dead Cards
        </button>
      </div>

      <div className="flex-container">
        <div className="selection-info">
          <h2>Selected Cards</h2>
          <div className="selected-cards">
            <div>
              <strong>Flop:</strong>
              {selectedFlop.map(
                (card, index) =>
                  card && (
                    <img
                      key={index}
                      src={`/images/cards/${card}.png`}
                      alt={card}
                      className="selected-card-icon"
                    />
                  )
              )}
              <button
                className="btn btn-sm btn-danger ml-3"
                onClick={() => clearCard("flop")}
              >
                Clear
              </button>
            </div>
            <div>
              <strong>Turn:</strong>
              {selectedTurn && (
                <img
                  src={`/images/cards/${selectedTurn}.png`}
                  alt={selectedTurn}
                  className="selected-card-icon"
                />
              )}
              <button
                className="btn btn-sm btn-danger ml-3"
                onClick={() => clearCard("turn")}
              >
                Clear
              </button>
            </div>
            <div>
              <strong>River:</strong>
              {selectedRiver && (
                <img
                  src={`/images/cards/${selectedRiver}.png`}
                  alt={selectedRiver}
                  className="selected-card-icon"
                />
              )}
              <button
                className="btn btn-sm btn-danger ml-3"
                onClick={() => clearCard("river")}
              >
                Clear
              </button>
            </div>
            <div>
              <strong>Dead:</strong>
              {selectedDead.map((card, index) => (
                <img
                  key={index}
                  src={`/images/cards/${card}.png`}
                  alt={card}
                  className="selected-card-icon"
                />
              ))}
              <button
                className="btn btn-sm btn-danger ml-3"
                onClick={() => clearCard("dead")}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="card-grid">{renderCardGrid()}</div>
      </div>

      <div className="section mt-4">
        <h2>Ranges</h2>
        <input
          type="text"
          value={ranges}
          onChange={(e) => setRanges(e.target.value)}
          placeholder="Enter ranges (e.g., TT+, A2s+, KTs+)"
          className="form-control"
        />
      </div>

      <div className="section mt-4">
        <h2>Hand Strengths</h2>
        <Select
          options={handStrengthOptions}
          isMulti
          value={selectedHandStrengths}
          onChange={handleHandStrengthsChange}
          placeholder="Select hand strengths"
          className="hand-strengths-select"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="btn btn-success mt-4 w-100"
        disabled={selectedFlop.includes("")}
      >
        Submit
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      {responseData && (
        <div className="response-data">
          <div className="summary-section">
            <h2>Summary</h2>
            <p>
              <strong>Total Range Count:</strong> {responseData.totalRangeCount}
            </p>
            <p>
              <strong>Total Dead Cards Range Count:</strong>{" "}
              {responseData.totalDeadCardsRangeCount}
            </p>
            <p>
              <strong>Difference:</strong> {responseData.difference}%
            </p>
          </div>

          <div className="counts-section">
            <h2>Range Counts</h2>
            {renderCounts(responseData.rangeCounts)}
          </div>

          <div className="counts-section">
            <h2>Dead Cards Range Counts</h2>
            {renderCounts(responseData.deadCardsRangeCounts)}
          </div>

          <div className="hands-section">
            <h2>Range Hands</h2>
            {renderHands(responseData.rangeHands)}
          </div>

          <div className="hands-section">
            <h2>Dead Cards Range Hands</h2>
            {renderHands(responseData.deadCardsRangeHands)}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;