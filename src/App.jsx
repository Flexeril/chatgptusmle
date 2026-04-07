import React, { useEffect, useMemo, useRef, useState } from "react";
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

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderStemWithHighlights(stem, highlights = []) {
  if (!highlights.length) {
    return escapeHtml(stem).replace(/\n/g, "<br />");
  }

  const sorted = [...highlights]
    .filter((h) => h.start < h.end)
    .sort((a, b) => a.start - b.start);

  let html = "";
  let cursor = 0;

  for (const h of sorted) {
    if (h.start > cursor) {
      html += escapeHtml(stem.slice(cursor, h.start));
    }

    html += `<mark style="background:#fde68a; padding:1px 2px; border-radius:3px;">${escapeHtml(
      stem.slice(h.start, h.end)
    )}</mark>`;

    cursor = h.end;
  }

  if (cursor < stem.length) {
    html += escapeHtml(stem.slice(cursor));
  }

  return html.replace(/\n/g, "<br />");
}

function getTextOffset(root, targetNode, targetOffset) {
  let count = 0;

  function walk(node) {
    if (node === targetNode) {
      count += targetOffset;
      throw new Error("FOUND");
    }

    if (node.nodeType === Node.TEXT_NODE) {
      count += node.textContent.length;
      return;
    }

    for (const child of node.childNodes) {
      walk(child);
    }
  }

  try {
    walk(root);
  } catch (e) {
    if (e.message === "FOUND") return count;
    throw e;
  }

  return count;
}

export default function App() {
  const [blockSize, setBlockSize] = useState(5);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewMode, setReviewMode] = useState("all");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [highlights, setHighlights] = useState({});
  const [crossedOutChoices, setCrossedOutChoices] = useState({});

  const stemRef = useRef(null);

  const subjects = useMemo(() => {
    const unique = [...new Set(allQuestions.map((q) => q.subject))];
    return ["All", ...unique];
  }, []);

  const filteredQuestions = useMemo(() => {
    if (subjectFilter === "All") return allQuestions;
    return allQuestions.filter((q) => q.subject === subjectFilter);
  }, [subjectFilter]);

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

  const missedQuestions = selectedQuestions.filter(
    (q) => answers[q.id] !== q.answer
  );

  const reviewQuestions =
    reviewMode === "missed" ? missedQuestions : selectedQuestions;

  const actualBlockCount = Math.min(blockSize, filteredQuestions.length);

  const startTest = () => {
    const shuffled = shuffleArray(filteredQuestions);
    const chosen = shuffled.slice(0, actualBlockCount);

    const initialHighlights = {};
    const initialCrossouts = {};

    chosen.forEach((q) => {
      initialHighlights[q.id] = [];
      initialCrossouts[q.id] = {};
    });

    setSelectedQuestions(chosen);
    setHighlights(initialHighlights);
    setCrossedOutChoices(initialCrossouts);
    setAnswers({});
    setCurrent(0);
    setFinished(false);
    setShowReview(false);
    setReviewMode("all");
    setTimeLeft(chosen.length * 90);
    setStarted(true);
  };

  const resetTest = () => {
    setStarted(false);
    setFinished(false);
    setShowReview(false);
    setReviewMode("all");
    setSelectedQuestions([]);
    setHighlights({});
    setCrossedOutChoices({});
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

  const handleStemMouseUp = () => {
    if (!stemRef.current || !currentQuestion) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (
      !stemRef.current.contains(range.startContainer) ||
      !stemRef.current.contains(range.endContainer)
    ) {
      return;
    }

    const start = getTextOffset(
      stemRef.current,
      range.startContainer,
      range.startOffset
    );
    const end = getTextOffset(
      stemRef.current,
      range.endContainer,
      range.endOffset
    );

    if (start === end) return;

    const normalized = {
      start: Math.min(start, end),
      end: Math.max(start, end),
    };

    setHighlights((prev) => {
      const existing = prev[currentQuestion.id] || [];
      return {
        ...prev,
        [currentQuestion.id]: [...existing, normalized],
      };
    });

    selection.removeAllRanges();
  };

  const clearHighlights = () => {
    if (!currentQuestion) return;

    setHighlights((prev) => ({
      ...prev,
      [currentQuestion.id]: [],
    }));
  };

  const toggleChoiceCrossout = (questionId, letter) => {
    setCrossedOutChoices((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [letter]: !(prev[questionId] || {})[letter],
      },
    }));
  };

  const clearCrossouts = () => {
    if (!currentQuestion) return;

    setCrossedOutChoices((prev) => ({
      ...prev,
      [currentQuestion.id]: {},
    }));
  };

  if (!started) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Free 120 Style Mini Test</h1>
          <p style={styles.subtitle}>
            Randomized questions • answers hidden until end
          </p>

          <div style={styles.controlsGrid}>
            <div style={styles.controlBox}>
              <label style={styles.label}>Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                style={styles.select}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.controlBox}>
              <label style={styles.label}>Block size</label>
              <select
                value={blockSize}
                onChange={(e) => setBlockSize(Number(e.target.value))}
                style={styles.select}
              >
                <option value={3}>3 questions</option>
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={20}>20 questions</option>
                <option value={40}>40 questions</option>
              </select>
            </div>
          </div>

          <p style={styles.info}>
            Available after filter: <strong>{filteredQuestions.length}</strong>
          </p>

          <p style={styles.info}>
            This block will contain <strong>{actualBlockCount}</strong>{" "}
            question{actualBlockCount === 1 ? "" : "s"} • Timer:{" "}
            <strong>{formatTime(actualBlockCount * 90)}</strong>
          </p>

          <button
            onClick={startTest}
            style={{
              ...styles.primaryButton,
              ...(filteredQuestions.length === 0 ? styles.disabledButton : {}),
            }}
            disabled={filteredQuestions.length === 0}
          >
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
          <p style={styles.info}>
            Missed: {missedQuestions.length} / {selectedQuestions.length}
          </p>

          <div style={styles.controlsGrid}>
            <div style={styles.controlBox}>
              <label style={styles.label}>Review mode</label>
              <select
                value={reviewMode}
                onChange={(e) => setReviewMode(e.target.value)}
                style={styles.select}
              >
                <option value="all">Review all questions</option>
                <option value="missed">Review missed only</option>
              </select>
            </div>
          </div>

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
            {reviewQuestions.length === 0 ? (
              <div style={styles.reviewCard}>
                <h2 style={styles.reviewTitle}>Nothing missed</h2>
                <p style={styles.info}>You got every question right.</p>
              </div>
            ) : (
              reviewQuestions.map((q, idx) => (
                <div key={q.id} style={styles.reviewCard}>
                  <h2 style={styles.reviewTitle}>
                    Question {idx + 1} • {q.subject}
                  </h2>

                  <div
                    style={styles.stem}
                    dangerouslySetInnerHTML={{
                      __html: renderStemWithHighlights(
                        q.stem,
                        highlights[q.id] || []
                      ),
                    }}
                  />

                  <div style={styles.optionsWrap}>
                    {Object.entries(q.options).map(([letter, text]) => {
                      const isCorrect = q.answer === letter;
                      const isChosen = answers[q.id] === letter;
                      const isCrossed = (crossedOutChoices[q.id] || {})[letter];

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
                            ...(isCrossed ? styles.crossedOutOption : {}),
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
              ))
            )}
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

        <div style={styles.highlightToolbar}>
          <div style={styles.info}>
            Select text in the stem to auto-highlight it. Right-click an answer
            choice to cross it out.
          </div>
          <div style={styles.buttonRowCompact}>
            <button onClick={clearHighlights} style={styles.secondaryButton}>
              Clear Highlights
            </button>
            <button onClick={clearCrossouts} style={styles.secondaryButton}>
              Clear Crossouts
            </button>
          </div>
        </div>

        <div
          ref={stemRef}
          style={styles.stem}
          onMouseUp={handleStemMouseUp}
          dangerouslySetInnerHTML={{
            __html: renderStemWithHighlights(
              currentQuestion.stem,
              highlights[currentQuestion.id] || []
            ),
          }}
        />

        <div style={styles.optionsWrap}>
          {Object.entries(currentQuestion.options).map(([letter, text]) => {
            const isCrossed =
              (crossedOutChoices[currentQuestion.id] || {})[letter];

            return (
              <label
                key={letter}
                style={{
                  ...styles.optionLabel,
                  ...(isCrossed ? styles.crossedOutOption : {}),
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleChoiceCrossout(currentQuestion.id, letter);
                }}
              >
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
            );
          })}
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
  controlsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  controlBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "bold",
  },
  select: {
    padding: "10px 14px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
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
  highlightToolbar: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  stem: {
    whiteSpace: "normal",
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
    userSelect: "none",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "28px",
    flexWrap: "wrap",
  },
  buttonRowCompact: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
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
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
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
  crossedOutOption: {
    textDecoration: "line-through",
    opacity: 0.55,
  },
  explanation: {
    marginTop: "18px",
    fontSize: "1rem",
    lineHeight: 1.6,
  },
};