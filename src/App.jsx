import React, { useEffect, useMemo, useState } from "react";
import { questions as allQuestions } from "./questions";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  const [blockSize, setBlockSize] = useState(5);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  const totalSeconds = blockSize * 90;

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, timeLeft]);

  const currentQuestion = selectedQuestions[current];

  const progress = useMemo(() => {
    if (!selectedQuestions.length) return 0;
    return ((current + 1) / selectedQuestions.length) * 100;
  }, [current, selectedQuestions]);

  const score = selectedQuestions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.answer ? 1 : 0);
  }, 0);

  const startTest = () => {
    const shuffled = shuffleArray(allQuestions);
    const chosen = shuffled.slice(0, Math.min(blockSize, allQuestions.length));
    setSelectedQuestions(chosen);
    setAnswers({});
    setCurrent(0);
    setFinished(false);
    setShowReview(false);
    setTimeLeft(chosen.length * 90);
    setStarted(true);
  };

  const resetTest = () => {
    setStarted(false);
    setFinished(false);
    setShowReview(false);
    setSelectedQuestions([]);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(0);
  };

  const chooseAnswer = (letter) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: letter,
    }));
  };

  const nextQuestion = () => {
    if (current < selectedQuestions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
    }
  };

  if (!started) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Free 120 Style Mini Test</h1>
          <p style={styles.subtitle}>
            Randomized questions • answers hidden until end
          </p>

          <div style={styles.section}>
            <label style={styles.label}>Choose block size:</label>
            <select
              value={blockSize}
              onChange={(e) => setBlockSize(Number(e.target.value))}
              style={styles.select}
            >
              <option value={3}>3 questions</option>
              <option value={5}>5 questions</option>
              <option value={10}>10 questions</option>
            </select>
          </div>

          <p style={styles.info}>
            Timer: about 90 seconds per question ({formatTime(totalSeconds)})
          </p>

          <button onClick={startTest} style={styles.primaryButton}>
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Test Complete</h1>
          <p style={styles.result}>
            Score: {score} / {selectedQuestions.length}
          </p>
          <p style={styles.info}>
            Time remaining: {formatTime(Math.max(timeLeft, 0))}
          </p>

          <div style={styles.buttonRow}>
            <button
              onClick={() => setShowReview((v) => !v)}
              style={styles.primaryButton}
            >
              {showReview ? "Hide Review" : "Show Review"}
            </button>

            <button onClick={resetTest} style={styles.secondaryButton}>
              New Block
            </button>
          </div>
        </div>

        {showReview && (
          <div style={{ maxWidth: 950, width: "100%" }}>
            {selectedQuestions.map((q, idx) => (
              <div key={q.id} style={styles.reviewCard}>
                <h2 style={styles.reviewTitle}>
                  Question {idx + 1} • {q.subject}
                </h2>

                <pre style={styles.stem}>{q.stem}</pre>

                <div style={styles.optionsWrap}>
                  {Object.entries(q.options).map(([letter, text]) => {
                    const isCorrect = q.answer === letter;
                    const isChosen = answers[q.id] === letter;

                    return (
                      <div
                        key={letter}
                        style={{
                          ...styles.reviewOption,
                          ...(isCorrect
                            ? styles.correctOption
                            : isChosen
                            ? styles.wrongOption
                            : {}),
                        }}
                      >
                        <strong>{letter}.</strong> {text}
                      </div>
                    );
                  })}
                </div>

                <p style={styles.explanation}>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.questionHeader}>
          Question {current + 1} of {selectedQuestions.length}
        </h2>

        <p style={styles.timer}>Time left: {formatTime(Math.max(timeLeft, 0))}</p>

        <div style={styles.progressBarOuter}>
          <div
            style={{
              ...styles.progressBarInner,
              width: `${progress}%`,
            }}
          />
        </div>

        <pre style={styles.stem}>{currentQuestion.stem}</pre>

        <div style={styles.optionsWrap}>
          {Object.entries(currentQuestion.options).map(([letter, text]) => (
            <label key={letter} style={styles.optionLabel}>
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                checked={answers[currentQuestion.id] === letter}
                onChange={() => chooseAnswer(letter)}
              />
              <span>
                <strong>{letter}.</strong> {text}
              </span>
            </label>
          ))}
        </div>

        <div style={styles.buttonRow}>
          <button
            onClick={prevQuestion}
            disabled={current === 0}
            style={{
              ...styles.secondaryButton,
              opacity: current === 0 ? 0.5 : 1,
              cursor: current === 0 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>

          <button onClick={nextQuestion} style={styles.primaryButton}>
            {current < selectedQuestions.length - 1 ? "Next" : "Submit Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "950px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  title: {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "2.5rem",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "24px",
  },
  section: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
  },
  select: {
    padding: "10px 14px",
    fontSize: "1rem",
    borderRadius: "8px",
  },
  info: {
    textAlign: "center",
    color: "#555",
  },
  result: {
    fontSize: "1.3rem",
    textAlign: "center",
    fontWeight: "bold",
  },
  questionHeader: {
    textAlign: "center",
    marginBottom: "8px",
  },
  timer: {
    textAlign: "center",
    color: "#555",
    marginBottom: "16px",
    fontSize: "1.1rem",
  },
  progressBarOuter: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "24px",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#111827",
  },
  stem: {
    whiteSpace: "pre-wrap",
    fontFamily: "Arial, sans-serif",
    fontSize: "1.15rem",
    lineHeight: 1.7,
    color: "#222",
    marginBottom: "28px",
  },
  optionsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  optionLabel: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "14px 16px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1.05rem",
    lineHeight: 1.5,
    backgroundColor: "#fafafa",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "28px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    fontSize: "1rem",
    cursor: "pointer",
  },
  reviewCard: {
    width: "100%",
    maxWidth: "950px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    marginTop: "20px",
  },
  reviewTitle: {
    marginTop: 0,
  },
  reviewOption: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#fafafa",
  },
  correctOption: {
    backgroundColor: "#dcfce7",
    border: "1px solid #22c55e",
  },
  wrongOption: {
    backgroundColor: "#fee2e2",
    border: "1px solid #ef4444",
  },
  explanation: {
    marginTop: "18px",
    fontSize: "1rem",
    lineHeight: 1.6,
  },
};