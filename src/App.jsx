import { useState } from "react";
import "./App.css";
import PRODUCTS from "./products";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateAnswers(correctProduct, allProducts) {
  const correctCode = correctProduct.code;
  const codes = allProducts.map(p => p.code);
  const wrongCodes = shuffle(codes.filter(c => c !== correctCode)).slice(0, 3);
  const answers = shuffle([
    { code: correctCode, isCorrect: true },
    ...wrongCodes.map(code => ({ code, isCorrect: false })),
  ]);
  return answers;
}

function askAudience(correctIndex) {
  const totalVotes = 500;
  const correctVotes = Math.floor(totalVotes * 0.65);
  const remaining = totalVotes - correctVotes;

  const rawWrong = [
    Math.random(),
    Math.random(),
    Math.random(),
  ];
  const rawSum = rawWrong.reduce((a, b) => a + b, 0);
  const wrongVotes = rawWrong.map(v => Math.floor((v / rawSum) * remaining));

  const votes = [0, 0, 0, 0];
  votes[correctIndex] = correctVotes;

  let wrongIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctIndex) continue;
    votes[i] = wrongVotes[wrongIdx++];
  }

  const total = votes.reduce((a, b) => a + b, 0);
  const diff = totalVotes - total;
  votes[correctIndex] += diff;

  const percentages = votes.map(v => Math.round((v / totalVotes) * 100));
  return { votes, percentages };
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() =>
    generateAnswers(PRODUCTS[0], PRODUCTS)
  );
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongDetails, setWrongDetails] = useState([]);

  const [usedFifty, setUsedFifty] = useState(false);
  const [visibleAnswers, setVisibleAnswers] = useState([0, 1, 2, 3]);

  const [audienceData, setAudienceData] = useState(null);
  const [showAudiencePanel, setShowAudiencePanel] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);

  const currentProduct = PRODUCTS[currentIndex];

  function resetForNextQuestion(nextIndex) {
    const nextProduct = PRODUCTS[nextIndex];
    const nextAnswers = generateAnswers(nextProduct, PRODUCTS);
    setCurrentIndex(nextIndex);
    setAnswers(nextAnswers);
    setSelectedIndex(null);
    setHasAnsweredCorrectly(false);
    setUsedFifty(false);
    setVisibleAnswers([0, 1, 2, 3]);
    setAudienceData(null);
    setShowAudiencePanel(false);
    setUsedAudience(false);
  }

  function handleAnswerClick(index) {
    if (!visibleAnswers.includes(index)) return;
    const answer = answers[index];

    setSelectedIndex(index);

    if (answer.isCorrect) {
      if (!hasAnsweredCorrectly) {
        setCorrectCount(c => c + 1);
        setHasAnsweredCorrectly(true);
      }
    } else {
      setWrongCount(w => w + 1);
      setWrongDetails(list => [
        ...list,
        {
          productName: currentProduct.name,
          correctCode: currentProduct.code,
          guessedCode: answer.code,
        },
      ]);
    }
  }

  function handleNextQuestion() {
    if (!hasAnsweredCorrectly) return;

    if (currentIndex === PRODUCTS.length - 1) return;

    resetForNextQuestion(currentIndex + 1);
  }

  function handleFiftyFifty() {
    if (usedFifty) return;

    const correctIdx = answers.findIndex(a => a.isCorrect);
    const wrongIndices = answers
      .map((a, i) => ({ a, i }))
      .filter(item => !item.a.isCorrect)
      .map(item => item.i);

    const toKeepWrong = shuffle(wrongIndices).slice(0, 1);
    const newVisible = [correctIdx, ...toKeepWrong].sort();
    setVisibleAnswers(newVisible);
    setUsedFifty(true);
  }

  function handleAskAudience() {
    if (usedAudience) return;

    const correctIdx = answers.findIndex(a => a.isCorrect);
    const data = askAudience(correctIdx);
    setAudienceData(data);
    setShowAudiencePanel(true);
    setUsedAudience(true);
  }

  const isQuizFinished = currentIndex === PRODUCTS.length - 1 && hasAnsweredCorrectly;

  return (
    <div className="app">
      <div className="app-inner">
        <header className="header">
          <div className="logo-title">
            <div className="logo-circle">
              <div className="logo-hat" />
            </div>
            <div className="logo-text">Lovejoys Product Code Quiz</div>
          </div>
          <div className="scoreboard">
            <div className="score-item">
              <span className="score-label">Correct Answers</span>
              <span className="score-value correct">{correctCount}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Wrong Guesses</span>
              <span className="score-value wrong">{wrongCount}</span>
            </div>
          </div>
        </header>

        <main className="main">
          <section className="question-section">
            <div className="question-box">
              <div className="question-label">Question {currentIndex + 1}</div>
              <div className="question-text">
                What is the correct code for{" "}
                <span className="question-product">{currentProduct.name}</span>?
              </div>
            </div>

            <div className="lifelines">
              <button
                className={`lifeline-btn ${usedFifty ? "lifeline-used" : ""}`}
                onClick={handleFiftyFifty}
                disabled={usedFifty}
              >
                50 / 50
              </button>
              <button
                className={`lifeline-btn ${usedAudience ? "lifeline-used" : ""}`}
                onClick={handleAskAudience}
                disabled={usedAudience}
              >
                Ask the Audience
              </button>
            </div>

            <div
              className={`audience-panel ${
                showAudiencePanel ? "audience-panel-visible" : ""
              }`}
            >
              {audienceData && (
                <div className="audience-inner">
                  <div className="audience-header">
                    <div className="audience-icon">
                      <div className="audience-circle">
                        <div className="audience-people" />
                      </div>
                    </div>
                    <div className="audience-title">Ask the Audience</div>
                    <div className="audience-subtitle">
                      Total votes: 500 • Correct answer favoured
                    </div>
                  </div>
                  <div className="audience-chart">
                    {audienceData.percentages.map((pct, i) => {
                      const labels = ["A", "B", "C", "D"];
                      const isVisible = visibleAnswers.includes(i);
                      return (
                        <div
                          key={i}
                          className={`audience-bar-group ${
                            isVisible ? "" : "audience-bar-hidden"
                          }`}
                        >
                          <div className="audience-bar-wrapper">
                            <div
                              className="audience-bar"
                              style={{ height: `${pct}%` }}
                            >
                              <div className="audience-bar-top" />
                            </div>
                          </div>
                          <div className="audience-bar-label">
                            {labels[i]} • {pct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="answers">
              {answers.map((answer, index) => {
                const isVisible = visibleAnswers.includes(index);
                const isSelected = selectedIndex === index;
                let stateClass = "";

                if (isSelected) {
                  if (answer.isCorrect) {
                    stateClass = "answer-correct";
                  } else {
                    stateClass = "answer-wrong";
                  }
                }

                const labels = ["A", "B", "C", "D"];

                return (
                  <button
                    key={index}
                    className={`answer-btn ${
                      isVisible ? "" : "answer-hidden"
                    } ${stateClass}`}
                    onClick={() => handleAnswerClick(index)}
                    disabled={!isVisible}
                  >
                    <span className="answer-label">{labels[index]}</span>
                    <span className="answer-text">
                      Code {answer.code}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="controls">
              <button
                className={`next-btn ${
                  hasAnsweredCorrectly ? "" : "next-disabled"
                }`}
                onClick={handleNextQuestion}
                disabled={!hasAnsweredCorrectly || currentIndex === PRODUCTS.length - 1}
              >
                Next Question
              </button>
            </div>
          </section>

          {isQuizFinished && (
            <section className="summary-section">
              <div className="summary-box">
                <h2 className="summary-title">Quiz Complete</h2>
                <p className="summary-text">
                  You answered <span className="summary-correct">{correctCount}</span>{" "}
                  questions correctly and made{" "}
                  <span className="summary-wrong">{wrongCount}</span> wrong guesses.
                </p>

                {wrongDetails.length > 0 ? (
                  <div className="summary-list">
                    <h3 className="summary-subtitle">You got these wrong:</h3>
                    <ul>
                      {wrongDetails.map((item, idx) => (
                        <li key={idx} className="summary-item">
                          <span className="summary-product">{item.productName}</span>{" "}
                          — Correct code:{" "}
                          <span className="summary-code-correct">
                            {item.correctCode}
                          </span>{" "}
                          • You guessed:{" "}
                          <span className="summary-code-wrong">
                            {item.guessedCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="summary-text">
                    You didn’t get any products wrong — nice work.
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
