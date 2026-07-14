import { useState } from "react";
import "./App.css";
import PRODUCTS from "./products"; // we will create this file next

// Utility: shuffle array
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Generate 4 answer options (1 correct + 3 random real codes)
function generateAnswers(correctCode, allProducts) {
  const codes = allProducts.map(p => p.code);
  const wrongCodes = shuffle(codes.filter(c => c !== correctCode)).slice(0, 3);
  return shuffle([correctCode, ...wrongCodes]);
}

// Generate Ask the Audience results
function askAudience(correctIndex) {
  const totalVotes = 500;

  // Audience gets correct answer 65% of the time
  const correctVotes = Math.floor(totalVotes * 0.65);

  // Remaining votes distributed randomly
  const remaining = totalVotes - correctVotes;

  const wrongVotes = [
    Math.floor(Math.random() * remaining),
    Math.floor(Math.random() * remaining),
    Math.floor(Math.random() * remaining)
  ];

  // Normalize wrong votes to exactly remaining
  const wrongTotal = wrongVotes.reduce((a, b) => a + b, 0);
  const scale = remaining / wrongTotal;

  const finalWrongVotes = wrongVotes.map(v => Math.floor(v * scale));

  const results = [0, 0, 0, 0];
  results[correctIndex] = correctVotes;

  let wi = 0;
  for (let i = 0; i < 4; i++) {
    if (i !== correctIndex) {
      results[i] = finalWrongVotes[wi++];
    }
  }

  return results;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [audienceUsed, setAudienceUsed] = useState(false);
  const [audienceResults, setAudienceResults] = useState(null);

  const product = PRODUCTS[step];
  const answers = generateAnswers(product.code, PRODUCTS);
  const correctIndex = answers.indexOf(product.code);

  const [visibleAnswers, setVisibleAnswers] = useState([0, 1, 2, 3]);

  function answer(index) {
    if (index === correctIndex) {
      setScore(score + 1);
    }

    if (step + 1 < PRODUCTS.length) {
      setStep(step + 1);
      setAudienceResults(null);
      setVisibleAnswers([0, 1, 2, 3]);
    } else {
      setFinished(true);
    }
  }

  function useFifty() {
    if (fiftyUsed) return;

    const wrongIndexes = visibleAnswers.filter(i => i !== correctIndex);
    const removeTwo = shuffle(wrongIndexes).slice(0, 2);

    setVisibleAnswers(visibleAnswers.filter(i => !removeTwo.includes(i)));
    setFiftyUsed(true);
  }

  function useAudience() {
    if (audienceUsed) return;

    const results = askAudience(correctIndex);
    setAudienceResults(results);
    setAudienceUsed(true);
  }

  return (
    <div className="lovejoys-container">
      <h1 className="title">Lovejoys Product Code Quiz</h1>

      {!finished ? (
        <>
          <div className="question-box">
            <h2>What is the code for:</h2>
            <h3 className="product-name">{product.name}</h3>
          </div>

          <div className="lifelines">
            <button
              className={`lifeline-btn ${fiftyUsed ? "disabled" : ""}`}
              onClick={useFifty}
            >
              50/50
            </button>

            <button
              className={`lifeline-btn ${audienceUsed ? "disabled" : ""}`}
              onClick={useAudience}
            >
              Ask the Audience
            </button>
          </div>

          {audienceResults && (
            <div className="audience-box">
              <h4>Audience Votes</h4>
              {visibleAnswers.map(i => (
                <p key={i}>
                  Option {String.fromCharCode(65 + i)}: {audienceResults[i]} votes
                </p>
              ))}
            </div>
          )}

          <div className="answers">
            {visibleAnswers.map(i => (
              <button
                key={i}
                onClick={() => answer(i)}
                className="answer-btn"
              >
                {answers[i]}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="results">
          <h2>Quiz Complete!</h2>
          <p>You scored {score} out of {PRODUCTS.length}</p>
          <button
            className="restart-btn"
            onClick={() => {
              setStep(0);
              setScore(0);
              setFinished(false);
              setFiftyUsed(false);
              setAudienceUsed(false);
              setAudienceResults(null);
              setVisibleAnswers([0, 1, 2, 3]);
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
