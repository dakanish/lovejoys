import { useState, useEffect } from "react";
import "./App.css";
import PRODUCTS from "./products";

// Sounds
const correctSound = new Audio("/sounds/correct.mp3");
const wrongSound = new Audio("/sounds/wrong.mp3");
const audienceSound = new Audio("/sounds/audience.mp3");
const nextSound = new Audio("/sounds/next.mp3");

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [visibleAnswers, setVisibleAnswers] = useState([0, 1, 2, 3]);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongDetails, setWrongDetails] = useState([]);

  const [audienceVisible, setAudienceVisible] = useState(false);
  const [audienceData, setAudienceData] = useState(null);

  const [answers, setAnswers] = useState([]);

  const currentProduct = PRODUCTS[currentIndex];

  // ⭐ Auto-generate answers ONLY when question changes
  useEffect(() => {
    const generateAnswers = () => {
      const correct = {
        label: "A",
        code: currentProduct.code,
        isCorrect: true,
      };

      const otherCodes = PRODUCTS
        .filter((p, idx) => idx !== currentIndex)
        .map(p => p.code);

      const shuffled = otherCodes.sort(() => Math.random() - 0.5);
      const wrongCodes = shuffled.slice(0, 3);

      const wrongAnswers = wrongCodes.map((code, i) => ({
        label: ["B", "C", "D"][i],
        code,
        isCorrect: false,
      }));

      const finalAnswers = [correct, ...wrongAnswers].sort(() => Math.random() - 0.5);

      setAnswers(finalAnswers);
    };

    generateAnswers();
  }, [currentIndex]);

  function resetForNextQuestion(nextIndex) {
    setCurrentIndex(nextIndex);
    setSelectedIndex(null);
    setVisibleAnswers([0, 1, 2, 3]);
    setHasAnsweredCorrectly(false);
    setAudienceVisible(false);
    setAudienceData(null);
  }

  function handleAnswerClick(index) {
    const answer = answers[index];

    setSelectedIndex(index);

    if (answer.isCorrect) {
      if (!hasAnsweredCorrectly) {
        setCorrectCount(c => c + 1);
        setHasAnsweredCorrectly(true);

        correctSound.currentTime = 0;
        correctSound.play();

        setTimeout(() => {
          if (currentIndex < PRODUCTS.length - 1) {
            resetForNextQuestion(currentIndex + 1);
          }
        }, 800);
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

      wrongSound.currentTime = 0;
      wrongSound.play();

      const wrongCounter = document.querySelector(".score-value.wrong");
      if (wrongCounter) {
        wrongCounter.classList.add("flash");
        setTimeout(() => wrongCounter.classList.remove("flash"), 600);
      }
    }
  }

  function handleFiftyFifty() {
    const correctIndex = answers.findIndex(a => a.isCorrect);
    const wrongIndexes = answers
      .map((a, i) => ({ a, i }))
      .filter(obj => !obj.a.isCorrect)
      .map(obj => obj.i);

    const randomWrong = wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
    setVisibleAnswers([correctIndex, randomWrong]);
  }

  function handleAskAudience() {
    audienceSound.currentTime = 0;
    audienceSound.play();

    const correctIndex = answers.findIndex(a => a.isCorrect);

    const data = answers.map((a, i) => {
      if (i === correctIndex) return 60;
      return Math.floor(Math.random() * 25);
    });

    setAudienceData(data);
    setAudienceVisible(true);
  }

  const isFinished = currentIndex >= PRODUCTS.length;

  return (
    <div className="app">
      <div className="app-inner">

        {/* Header */}
        <div className="header">
          <div className="logo-title">
            <div className="logo-circle">
              <div className="logo-hat"></div>
            </div>
            <div className="logo-text">Lovejoys Product Trainer</div>
          </div>

          <div className="scoreboard">
            <div className="score-item">
              <div className="score-label">Correct</div>
              <div className="score-value correct">{correctCount}</div>
            </div>

            <div className="score-item">
              <div className="score-label">Wrong</div>
              <div className="score-value wrong">{wrongCount}</div>
            </div>
          </div>
        </div>

        {/* Finished */}
        {isFinished ? (
          <div className="summary-section">
            <div className="summary-box">
              <h2 className="summary-title">Quiz Complete!</h2>
              <p className="summary-text">
                You got <span className="summary-correct">{correctCount}</span> correct and{" "}
                <span className="summary-wrong">{wrongCount}</span> wrong.
              </p>

              {wrongDetails.length > 0 && (
                <div className="summary-list">
                  <h3 className="summary-subtitle">Incorrect Answers</h3>
                  {wrongDetails.map((item, i) => (
                    <div key={i} className="summary-item">
                      <span className="summary-product">{item.productName}</span>: correct code{" "}
                      <span className="summary-code-correct">{item.correctCode}</span>, you chose{" "}
                      <span className="summary-code-wrong">{item.guessedCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Question */}
            <div className="question-section">
              <div className="question-box">
                <div className="question-label">Product</div>
                <div className="question-text">
                  <span className="question-product">{currentProduct.name}</span>
                </div>
              </div>

              {/* Lifelines */}
              <div className="lifelines">
                <button className="lifeline-btn" onClick={handleFiftyFifty}>
                  50/50
                </button>

                <button className="lifeline-btn" onClick={handleAskAudience}>
                  Ask the Audience
                </button>
              </div>

              {/* Audience Panel */}
              <div className={`audience-panel ${audienceVisible ? "audience-panel-visible" : ""}`}>
                {audienceVisible && (
                  <div className="audience-inner">
                    <div className="audience-header">
                      <div className="audience-icon">
                        <div className="audience-circle">
                          <div className="audience-people"></div>
                        </div>
                      </div>
                      <div>
                        <div className="audience-title">Audience Vote</div>
                        <div className="audience-subtitle">Percentage guesses</div>
                      </div>
                    </div>

                    <div className="audience-chart">
                      {audienceData && audienceData.map((pct, i) => (
                        <div key={i} className="audience-bar-wrapper">
                          <div className="audience-bar" style={{ height: `${pct}%` }}></div>
                          <div className="audience-bar-label">{pct}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Answers */}
              <div className="answers">
                {answers.map((answer, i) => {
                  const isHidden = !visibleAnswers.includes(i);
                  const isSelected = selectedIndex === i;

                  let className = "answer-btn";
                  if (isHidden) className += " answer-hidden";
                  if (isSelected && answer.isCorrect) className += " answer-correct";
                  if (isSelected && !answer.isCorrect) className += " answer-wrong";

                  return (
                    <button key={i} className={className} onClick={() => handleAnswerClick(i)}>
                      <span className="answer-label">{answer.label}</span>
                      <span className="answer-text">{answer.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
