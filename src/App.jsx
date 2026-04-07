import React, { useEffect, useMemo, useRef, useState } from "react";
import { questions as allQuestions } from "./questions";

const SCORE_STORAGE_KEY = "chatgptusmle_attempt_history";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function mergeHighlightRanges(ranges) {
  if (!ranges.length) return [];
  const sorted = [...ranges]
    .filter((r) => r.start < r.end)
    .sort((a, b) => a.start - b.start);

  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

function getTextNodesIn(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;

  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  return nodes;
}

function getAbsoluteOffset(root, targetNode, targetOffset) {
  const textNodes = getTextNodesIn(root);
  let total = 0;

  for (const node of textNodes) {
    if (node === targetNode) {
      return total + targetOffset;
    }
    total += node.textContent.length;
  }

  return total;
}

function HighlightedStem({ stem, highlights, stemRef, onMouseUp, style }) {
  const merged = mergeHighlightRanges(highlights || []);
  const lines = stem.split("\n");

  let globalIndex = 0;

  return (
    <div ref={stemRef} style={style} onMouseUp={onMouseUp}>
      {lines.map((line, lineIndex) => {
        const lineStart = globalIndex;
        const lineEnd = lineStart + line.length;
        globalIndex = lineEnd + 1;

        const pieces = [];
        let cursor = lineStart;

        const relevant = merged.filter(
          (h) => h.end > lineStart && h.start < lineEnd
        );

        for (const h of relevant) {
          const start = Math.max(h.start, lineStart);
          const end = Math.min(h.end, lineEnd);

          if (start > cursor) {
            pieces.push({
              type: "plain",
              text: stem.slice(cursor, start),
            });
          }

          pieces.push({
            type: "highlight",
            text: stem.slice(start, end),
          });

          cursor = end;
        }

        if (cursor < lineEnd) {
          pieces.push({
            type: "plain",
            text: stem.slice(cursor, lineEnd),
          });
        }

        if (pieces.length === 0) {
          pieces.push({ type: "plain", text: "" });
        }

        return (
          <div key={lineIndex}>
            {pieces.map((piece, pieceIndex) =>
              piece.type === "highlight" ? (
                <mark key={pieceIndex} style={styles.mark}>
                  {piece.text}
                </mark>
              ) : (
                <span key={pieceIndex}>{piece.text}</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuestionImage({ image, alt }) {
  if (!image) return null;

  return (
    <div style={styles.imageWrap}>
      <img src={image} alt={alt || "Question figure"} style={styles.questionImage} />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
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
  const [wasCancelled, setWasCancelled] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState([]);

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
    try {
      const saved = localStorage.getItem(SCORE_STORAGE_KEY);
      if (saved) {
        setAttemptHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load attempt history:", error);
    }
  }, []);

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

  const saveAttempt = (cancelled) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      score,
      total: selectedQuestions.length,
      subjectFilter,
      blockSize: selectedQuestions.length,
      cancelled,
      unanswered: selectedQuestions.filter((q) => answers[q.id] == null).length,
      timeRemaining: timeLeft,
    };

    const updated = [entry, ...attemptHistory].slice(0, 20);
    setAttemptHistory(updated);

    try {
      localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save attempt history:", error);
    }
  };

  const clearAttemptHistory = () => {
    const confirmed = window.confirm("Clear all saved score history?");
    if (!confirmed) return;

    setAttemptHistory([]);
    localStorage.removeItem(SCORE_STORAGE_KEY);
  };

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
    setWasCancelled(false);
    setTimeLeft(chosen.length * 90);
    setStarted(true);
    setScreen("test");
  };

  const resetToHome = () => {
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
    setWasCancelled(false);
    setScreen("home");
  };

  const cancelTest = () => {
    const confirmed = window.confirm(
      "End the test now? Any unanswered questions will be counted as incorrect."
    );
    if (!confirmed) return;

    setWasCancelled(true);
    setFinished(true);
    setShowReview(false);
  };

  useEffect(() => {
    if (!finished || !started) return;
    saveAttempt(wasCancelled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

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

    if (
      range.startContainer.nodeType !== Node.TEXT_NODE ||
      range.endContainer.nodeType !== Node.TEXT_NODE
    ) {
      return;
    }

    const start = getAbsoluteOffset(
      stemRef.current,
      range.startContainer,
      range.startOffset
    );
    const end = getAbsoluteOffset(
      stemRef.current,
      range.endContainer,
      range.endOffset
    );

    if (start === end) return;

    const normalized = {
      start: Math.min(start, end),
      end: Math.max(start, end),
    };

    setHighlights((prev) => ({
      ...prev,
      [currentQuestion.id]: mergeHighlightRanges([
        ...(prev[currentQuestion.id] || []),
        normalized,
      ]),
    }));

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

  if (screen === "home") {
    return (
      <div style={styles.page}>
        <div style={styles.heroCard}>
          <h1 style={styles.heroTitle}>ChatGPT USMLE</h1>
          <p style={styles.heroSubtitle}>
            Build Free 120-style timed blocks, review misses, and track recent performance.
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

          <div style={styles.buttonRow}>
            <button
              onClick={startTest}
              style={{
                ...styles.primaryButton,
                ...(filteredQuestions.length === 0 ? styles.disabledButton : {}),
              }}
              disabled={filteredQuestions.length === 0}
            >
              Start New Block
            </button>
          </div>
        </div>

        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionTitle}>Recent Attempts</h2>
            {attemptHistory.length > 0 && (
              <button onClick={clearAttemptHistory} style={styles.secondaryButton}>
                Clear History
              </button>
            )}
          </div>

          {attemptHistory.length === 0 ? (
            <p style={styles.emptyText}>No attempts saved yet.</p>
          ) : (
            <div style={styles.historyList}>
              {attemptHistory.map((attempt) => (
                <div key={attempt.id} style={styles.historyItem}>
                  <div style={styles.historyTopRow}>
                    <strong>
                      {attempt.score}/{attempt.total}
                    </strong>
                    <span style={styles.historyTimestamp}>
                      {formatTimestamp(attempt.timestamp)}
                    </span>
                  </div>
                  <div style={styles.historyMeta}>
                    <span>Subject: {attempt.subjectFilter}</span>
                    <span>Block: {attempt.blockSize}</span>
                    <span>
                      Status: {attempt.cancelled ? "Cancelled early" : "Completed"}
                    </span>
                    <span>Unanswered: {attempt.unanswered}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>
            {wasCancelled ? "Test Ended Early" : "Test Complete"}
          </h1>
          <p style={styles.result}>
            Score: {score} / {selectedQuestions.length}
          </p>
          <p style={styles.info}>
            Time remaining: {formatTime(Math.max(timeLeft, 0))}
          </p>
          <p style={styles.info}>
            Missed: {missedQuestions.length} / {selectedQuestions.length}
          </p>
          {wasCancelled && (
            <p style={styles.warningText}>
              Unanswered questions were counted as incorrect.
            </p>
          )}

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

            <button onClick={resetToHome} style={styles.secondaryButton}>
              Back to Home
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

                  <QuestionImage image={q.image} alt={`Question ${idx + 1} figure`} />

                  <HighlightedStem
                    stem={q.stem}
                    highlights={highlights[q.id] || []}
                    style={styles.stem}
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
        <div style={styles.topRow}>
          <button onClick={resetToHome} style={styles.secondaryButton}>
            Home
          </button>
          <button onClick={cancelTest} style={styles.dangerButton}>
            Cancel Test
          </button>
        </div>

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

        <QuestionImage
          image={currentQuestion.image}
          alt={`Question ${current + 1} figure`}
        />

        <HighlightedStem
          stem={currentQuestion.stem}
          highlights={highlights[currentQuestion.id] || []}
          stemRef={stemRef}
          onMouseUp={handleStemMouseUp}
          style={styles.stem}
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
    gap: "24px",
  },
  heroCard: {
    width: "100%",
    maxWidth: "950px",
    background:
      "linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)",
    borderRadius: "20px",
    padding: "40px 32px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
  },
  historyCard: {
    width: "100%",
    maxWidth: "950px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  card: {
    width: "100%",
    maxWidth: "950px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  heroTitle: {
    marginTop: 0,
    marginBottom: "10px",
    fontSize: "3rem",
    textAlign: "center",
  },
  heroSubtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: "28px",
    fontSize: "1.1rem",
  },
  title: {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "2.5rem",
    textAlign: "center",
  },
  sectionTitle: {
    margin: 0,
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
    backgroundColor: "white",
  },
  info: {
    textAlign: "center",
    color: "#555",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginBottom: 0,
  },
  warningText: {
    textAlign: "center",
    color: "#b45309",
    fontWeight: "bold",
  },
  result: {
    fontSize: "1.3rem",
    textAlign: "center",
    fontWeight: "bold",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  historyItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "14px 16px",
    backgroundColor: "#fafafa",
  },
  historyTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  historyMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    color: "#666",
    fontSize: "0.95rem",
  },
  historyTimestamp: {
    color: "#666",
    fontSize: "0.95rem",
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
  imageWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  questionImage: {
    maxWidth: "100%",
    maxHeight: "420px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    objectFit: "contain",
    backgroundColor: "white",
  },
  stem: {
    whiteSpace: "normal",
    fontFamily: "Arial, sans-serif",
    fontSize: "1.15rem",
    lineHeight: 1.7,
    color: "#222",
    marginBottom: "28px",
  },
  mark: {
    background: "#fde68a",
    padding: "1px 2px",
    borderRadius: "3px",
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
  dangerButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#b91c1c",
    color: "white",
    fontSize: "0.95rem",
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