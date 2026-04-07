import React, { useEffect, useMemo, useRef, useState } from "react";
import { questions as allQuestions } from "./questions";

const SCORE_STORAGE_KEY = "chatgptusmle_attempt_history";
const SESSION_STORAGE_KEY = "chatgptusmle_active_session";
const FULL_EXAM_BLOCK_SIZE = 40;

const UI_STORAGE_KEYS = {
  navigatorCollapsed: "chatgptusmle_navigator_collapsed",
  navigatorFilter: "chatgptusmle_navigator_filter",
  calculatorPos: "chatgptusmle_calculator_pos",
  labsPos: "chatgptusmle_labs_pos",
  calculatorMinimized: "chatgptusmle_calculator_minimized",
  labsMinimized: "chatgptusmle_labs_minimized",
};

const DEFAULT_CALCULATOR_POS = { x: 980, y: 110 };
const DEFAULT_LABS_POS = { x: 980, y: 430 };

const LAB_SECTIONS = [
  {
    title: "Serum / Chemistry",
    items: [
      ["Sodium (Na+)", "136–146 mEq/L"],
      ["Potassium (K+)", "3.5–5.0 mEq/L"],
      ["Chloride (Cl−)", "95–105 mEq/L"],
      ["Bicarbonate (HCO3−)", "22–28 mEq/L"],
      ["Urea nitrogen", "7–18 mg/dL"],
      ["Creatinine", "0.6–1.2 mg/dL"],
      ["Glucose, fasting", "70–100 mg/dL"],
      ["Calcium", "8.4–10.2 mg/dL"],
      ["Magnesium", "1.5–2.0 mg/dL"],
      ["Phosphorus", "3.0–4.5 mg/dL"],
      ["AST", "12–38 U/L"],
      ["ALT", "10–40 U/L"],
      ["Alkaline phosphatase", "25–100 U/L"],
      ["Total bilirubin", "0.1–1.0 mg/dL"],
      ["Direct bilirubin", "0.0–0.3 mg/dL"],
      ["Albumin", "3.5–5.5 g/dL"],
    ],
  },
  {
    title: "Hematology",
    items: [
      ["WBC", "4,500–11,000/mm³"],
      ["Hemoglobin, male", "13.5–17.5 g/dL"],
      ["Hemoglobin, female", "12.0–16.0 g/dL"],
      ["Hematocrit, male", "41%–53%"],
      ["Hematocrit, female", "36%–46%"],
      ["MCV", "80–100 fL"],
      ["Platelets", "150,000–400,000/mm³"],
      ["PTT", "25–40 sec"],
      ["PT", "11–15 sec"],
      ["Reticulocytes", "0.5%–1.5%"],
      ["Troponin I", "≤0.04 ng/mL"],
    ],
  },
  {
    title: "ABG",
    items: [
      ["pH", "7.35–7.45"],
      ["PCO2", "33–45 mm Hg"],
      ["PO2", "75–105 mm Hg"],
    ],
  },
  {
    title: "Endocrine",
    items: [
      ["TSH", "0.4–4.0 mIU/L"],
      ["T3", "100–200 ng/dL"],
      ["T4", "5–12 μg/dL"],
      ["Free T4", "0.9–1.7 ng/dL"],
      ["Cortisol, 0800 h", "5–23 μg/dL"],
      ["Prolactin, male", "<17 ng/mL"],
      ["Prolactin, female", "<25 ng/mL"],
      ["Intact PTH", "10–60 pg/mL"],
    ],
  },
  {
    title: "CSF",
    items: [
      ["Cell count", "0–5/mm³"],
      ["Glucose", "40–70 mg/dL"],
      ["Protein, total", "<40 mg/dL"],
      ["Pressure", "70–180 mm H2O"],
    ],
  },
];

function readStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function readStoredBool(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw === "true";
  } catch {
    return fallback;
  }
}

function writeStoredBool(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function readStoredString(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStoredString(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function clearActiveSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

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

  const merged = [{ ...sorted[0] }];

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
  while ((node = walker.nextNode())) nodes.push(node);
  return nodes;
}

function getAbsoluteOffset(root, targetNode, targetOffset) {
  const textNodes = getTextNodesIn(root);
  let total = 0;
  for (const node of textNodes) {
    if (node === targetNode) return total + targetOffset;
    total += node.textContent.length;
  }
  return total;
}

function getQuestionImageSrc(question) {
  if (question.image) return question.image;
  if (question.hasImage) return `/images/question${question.id}.png`;
  return null;
}

function startIndexWithinSegment(absoluteIndex, baseOffset) {
  return absoluteIndex - baseOffset;
}

function StemTextSegment({ text, highlights, baseOffset }) {
  const merged = mergeHighlightRanges(highlights || []);
  const lines = text.split("\n");
  let localGlobalIndex = 0;

  return (
    <>
      {lines.map((line, lineIndex) => {
        const lineStart = baseOffset + localGlobalIndex;
        const lineEnd = lineStart + line.length;
        localGlobalIndex += line.length + 1;

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
              text: text.slice(
                startIndexWithinSegment(cursor, baseOffset),
                startIndexWithinSegment(start, baseOffset)
              ),
            });
          }

          pieces.push({
            type: "highlight",
            text: text.slice(
              startIndexWithinSegment(start, baseOffset),
              startIndexWithinSegment(end, baseOffset)
            ),
          });

          cursor = end;
        }

        if (cursor < lineEnd) {
          pieces.push({
            type: "plain",
            text: text.slice(
              startIndexWithinSegment(cursor, baseOffset),
              startIndexWithinSegment(lineEnd, baseOffset)
            ),
          });
        }

        if (pieces.length === 0) pieces.push({ type: "plain", text: "" });

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
    </>
  );
}

function InlineStemWithImage({
  stem,
  image,
  highlights,
  stemRef,
  onMouseUp,
  style,
}) {
  const parts = stem.split("[IMAGE]");
  let baseOffset = 0;

  return (
    <div ref={stemRef} style={style} onMouseUp={onMouseUp}>
      {parts.map((part, index) => {
        const currentBase = baseOffset;
        baseOffset += part.length;

        return (
          <React.Fragment key={index}>
            <StemTextSegment
              text={part}
              highlights={highlights}
              baseOffset={currentBase}
            />
            {index < parts.length - 1 && image && (
              <div style={styles.imageWrap}>
                <img
                  src={image}
                  alt="Question figure"
                  style={styles.questionImage}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DraggablePanel({
  title,
  onClose,
  position,
  setPosition,
  minimized,
  setMinimized,
  children,
  width = 320,
}) {
  const dragState = useRef({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  const onMouseDown = (e) => {
    dragState.current.dragging = true;
    dragState.current.offsetX = e.clientX - position.x;
    dragState.current.offsetY = e.clientY - position.y;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragState.current.dragging) return;
      setPosition({
        x: Math.max(8, e.clientX - dragState.current.offsetX),
        y: Math.max(8, e.clientY - dragState.current.offsetY),
      });
    };

    const onMouseUp = () => {
      dragState.current.dragging = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [setPosition, position.x, position.y]);

  return (
    <div
      style={{
        ...styles.draggablePanel,
        width,
        left: position.x,
        top: position.y,
      }}
    >
      <div style={styles.panelHeader} onMouseDown={onMouseDown}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{title}</h3>
        <div style={styles.panelHeaderButtons}>
          <button
            onClick={() => setMinimized((v) => !v)}
            style={styles.panelCloseButton}
            onMouseDown={(e) => e.stopPropagation()}
            title={minimized ? "Expand" : "Minimize"}
          >
            {minimized ? "▢" : "—"}
          </button>
          <button
            onClick={onClose}
            style={styles.panelCloseButton}
            onMouseDown={(e) => e.stopPropagation()}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      {!minimized && children}
    </div>
  );
}

function FloatingCalculator({
  isOpen,
  onClose,
  position,
  setPosition,
  minimized,
  setMinimized,
}) {
  const [display, setDisplay] = useState("");

  const appendValue = (value) => setDisplay((prev) => prev + value);
  const clearDisplay = () => setDisplay("");
  const backspace = () => setDisplay((prev) => prev.slice(0, -1));

  const calculate = () => {
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${display})`)();
      setDisplay(String(result));
    } catch {
      setDisplay("Error");
    }
  };

  if (!isOpen) return null;

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "(", ")"],
  ];

  return (
    <DraggablePanel
      title="Calculator"
      onClose={onClose}
      position={position}
      setPosition={setPosition}
      minimized={minimized}
      setMinimized={setMinimized}
      width={320}
    >
      <div style={styles.calculatorDisplay}>{display || "0"}</div>

      <div style={styles.calculatorGrid}>
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => appendValue(btn)}
            style={styles.calcButton}
          >
            {btn}
          </button>
        ))}
        <button onClick={() => appendValue("+")} style={styles.calcButton}>
          +
        </button>
        <button onClick={clearDisplay} style={styles.calcButton}>
          C
        </button>
        <button onClick={backspace} style={styles.calcButton}>
          ⌫
        </button>
        <button onClick={calculate} style={styles.calcEqualsButton}>
          =
        </button>
      </div>
    </DraggablePanel>
  );
}

function FloatingLabs({
  isOpen,
  onClose,
  position,
  setPosition,
  minimized,
  setMinimized,
}) {
  const [openSection, setOpenSection] = useState("Serum / Chemistry");

  if (!isOpen) return null;

  return (
    <DraggablePanel
      title="Reference Labs"
      onClose={onClose}
      position={position}
      setPosition={setPosition}
      minimized={minimized}
      setMinimized={setMinimized}
      width={430}
    >
      <div style={styles.labsAccordion}>
        {LAB_SECTIONS.map((section) => (
          <div key={section.title}>
            <button
              onClick={() =>
                setOpenSection((prev) =>
                  prev === section.title ? "" : section.title
                )
              }
              style={styles.labsSectionHeader}
            >
              {section.title}
            </button>

            {openSection === section.title && (
              <div style={styles.labsSectionContent}>
                {section.items.map(([name, value]) => (
                  <div key={name} style={styles.labRow}>
                    <span>{name}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </DraggablePanel>
  );
}

function QuestionNavigator({
  selectedQuestions,
  answers,
  flaggedQuestions,
  current,
  onGoToQuestion,
  collapsed,
  setCollapsed,
  filter,
  setFilter,
}) {
  const filteredQuestions = selectedQuestions
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => {
      if (filter === "all") return true;
      if (filter === "unanswered") return answers[q.id] == null;
      if (filter === "flagged") return !!flaggedQuestions[q.id];
      return true;
    });

  return (
    <div style={styles.navigatorContainer}>
      <div style={styles.navigatorHeader}>
        <div style={styles.navigatorHeaderLeft}>
          <button
            onClick={() => setCollapsed((v) => !v)}
            style={styles.secondaryButton}
          >
            {collapsed ? "Show Navigator" : "Hide Navigator"}
          </button>

          {!collapsed && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={styles.navigatorFilterSelect}
            >
              <option value="all">All</option>
              <option value="unanswered">Unanswered</option>
              <option value="flagged">Flagged</option>
            </select>
          )}
        </div>
      </div>

      {!collapsed && (
        <div style={styles.navigatorWrap}>
          {filteredQuestions.map(({ q, index }) => {
            const answered = answers[q.id] != null;
            const flagged = !!flaggedQuestions[q.id];
            const isCurrent = index === current;

            return (
              <button
                key={q.id}
                onClick={() => onGoToQuestion(index)}
                style={{
                  ...styles.navigatorButton,
                  ...(answered
                    ? styles.navigatorAnswered
                    : styles.navigatorUnanswered),
                  ...(flagged ? styles.navigatorFlagged : {}),
                  ...(isCurrent ? styles.navigatorCurrent : {}),
                }}
                title={`Question ${index + 1}${flagged ? " • flagged" : ""}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlockSummaryPage({
  selectedQuestions,
  answers,
  flaggedQuestions,
  currentQuestionId,
  onGoToQuestion,
  onBack,
  onSubmit,
  mode,
}) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Block Summary</h1>
        <p style={styles.info}>
          Review unanswered and flagged questions before submitting this block.
        </p>

        <div style={styles.summaryLegend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.summaryChip, ...styles.summaryAnswered }} />
            Answered
          </div>
          <div style={styles.legendItem}>
            <span
              style={{ ...styles.summaryChip, ...styles.summaryUnanswered }}
            />
            Unanswered
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.summaryChip, ...styles.summaryFlagged }} />
            Flagged
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.summaryChip, ...styles.summaryCurrent }} />
            Current
          </div>
        </div>

        <div style={styles.summaryGrid}>
          {selectedQuestions.map((q, index) => {
            const answered = answers[q.id] != null;
            const flagged = !!flaggedQuestions[q.id];
            const current = q.id === currentQuestionId;

            return (
              <button
                key={q.id}
                onClick={() => onGoToQuestion(index)}
                style={{
                  ...styles.summaryQuestionButton,
                  ...(answered
                    ? styles.summaryAnswered
                    : styles.summaryUnanswered),
                  ...(flagged ? styles.summaryFlaggedBorder : {}),
                  ...(current ? styles.summaryCurrentOutline : {}),
                }}
              >
                <div style={styles.summaryQuestionNumber}>{index + 1}</div>
                <div style={styles.summaryQuestionStatus}>
                  {answered ? "Answered" : "Unanswered"}
                  {flagged ? " • Flagged" : ""}
                </div>
              </button>
            );
          })}
        </div>

        <div style={styles.buttonRow}>
          <button onClick={onBack} style={styles.secondaryButton}>
            Back to Questions
          </button>
          <button onClick={onSubmit} style={styles.primaryButton}>
            {mode === "full" ? "Finish Block" : "Submit Block"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("custom");
  const [blockSize, setBlockSize] = useState(5);
  const [subjectFilter, setSubjectFilter] = useState("All");

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewMode, setReviewMode] = useState("all");

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [allExamQuestions, setAllExamQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [current, setCurrent] = useState(0);

  const [answers, setAnswers] = useState({});
  const [highlights, setHighlights] = useState({});
  const [crossedOutChoices, setCrossedOutChoices] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [wasCancelled, setWasCancelled] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState([]);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [blockTransition, setBlockTransition] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [labsOpen, setLabsOpen] = useState(false);

  const [navigatorCollapsed, setNavigatorCollapsed] = useState(() =>
    readStoredBool(UI_STORAGE_KEYS.navigatorCollapsed, false)
  );
  const [navigatorFilter, setNavigatorFilter] = useState(() =>
    readStoredString(UI_STORAGE_KEYS.navigatorFilter, "all")
  );

  const [calculatorPos, setCalculatorPos] = useState(() =>
    readStoredJson(UI_STORAGE_KEYS.calculatorPos, DEFAULT_CALCULATOR_POS)
  );
  const [labsPos, setLabsPos] = useState(() =>
    readStoredJson(UI_STORAGE_KEYS.labsPos, DEFAULT_LABS_POS)
  );

  const [calculatorMinimized, setCalculatorMinimized] = useState(() =>
    readStoredBool(UI_STORAGE_KEYS.calculatorMinimized, false)
  );
  const [labsMinimized, setLabsMinimized] = useState(() =>
    readStoredBool(UI_STORAGE_KEYS.labsMinimized, false)
  );

  const [resumeLoaded, setResumeLoaded] = useState(false);

  const stemRef = useRef(null);

  useEffect(() => {
    writeStoredBool(UI_STORAGE_KEYS.navigatorCollapsed, navigatorCollapsed);
  }, [navigatorCollapsed]);

  useEffect(() => {
    writeStoredString(UI_STORAGE_KEYS.navigatorFilter, navigatorFilter);
  }, [navigatorFilter]);

  useEffect(() => {
    writeStoredJson(UI_STORAGE_KEYS.calculatorPos, calculatorPos);
  }, [calculatorPos]);

  useEffect(() => {
    writeStoredJson(UI_STORAGE_KEYS.labsPos, labsPos);
  }, [labsPos]);

  useEffect(() => {
    writeStoredBool(UI_STORAGE_KEYS.calculatorMinimized, calculatorMinimized);
  }, [calculatorMinimized]);

  useEffect(() => {
    writeStoredBool(UI_STORAGE_KEYS.labsMinimized, labsMinimized);
  }, [labsMinimized]);

  const subjects = useMemo(() => {
    const unique = [...new Set(allQuestions.map((q) => q.subject))];
    return ["All", ...unique];
  }, []);

  const filteredQuestions = useMemo(() => {
    if (subjectFilter === "All") return allQuestions;
    return allQuestions.filter((q) => q.subject === subjectFilter);
  }, [subjectFilter]);

  const totalExamBlocks = useMemo(() => {
    if (mode !== "full") return 1;
    return Math.ceil(allExamQuestions.length / FULL_EXAM_BLOCK_SIZE) || 1;
  }, [mode, allExamQuestions.length]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCORE_STORAGE_KEY);
      if (saved) setAttemptHistory(JSON.parse(saved));
    } catch (error) {
      console.error("Failed to load attempt history:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        setResumeLoaded(true);
        return;
      }
      const session = JSON.parse(raw);
      if (!session || session.finished) {
        clearActiveSession();
        setResumeLoaded(true);
        return;
      }

      setScreen(session.screen || "test");
      setMode(session.mode || "custom");
      setBlockSize(session.blockSize ?? 5);
      setSubjectFilter(session.subjectFilter || "All");
      setStarted(!!session.started);
      setFinished(!!session.finished);
      setShowReview(!!session.showReview);
      setReviewMode(session.reviewMode || "all");
      setSelectedQuestions(session.selectedQuestions || []);
      setAllExamQuestions(session.allExamQuestions || []);
      setTimeLeft(session.timeLeft ?? 0);
      setCurrent(session.current ?? 0);
      setAnswers(session.answers || {});
      setHighlights(session.highlights || {});
      setCrossedOutChoices(session.crossedOutChoices || {});
      setFlaggedQuestions(session.flaggedQuestions || {});
      setWasCancelled(!!session.wasCancelled);
      setCurrentBlockIndex(session.currentBlockIndex ?? 0);
      setBlockTransition(!!session.blockTransition);
      setCalculatorOpen(!!session.calculatorOpen);
      setLabsOpen(!!session.labsOpen);
    } catch {
      clearActiveSession();
    } finally {
      setResumeLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!resumeLoaded) return;

    const shouldPersist =
      started && !finished && (screen === "test" || screen === "summary");

    if (!shouldPersist) {
      clearActiveSession();
      return;
    }

    const session = {
      screen,
      mode,
      blockSize,
      subjectFilter,
      started,
      finished,
      showReview,
      reviewMode,
      selectedQuestions,
      allExamQuestions,
      timeLeft,
      current,
      answers,
      highlights,
      crossedOutChoices,
      flaggedQuestions,
      wasCancelled,
      currentBlockIndex,
      blockTransition,
      calculatorOpen,
      labsOpen,
    };

    writeStoredJson(SESSION_STORAGE_KEY, session);
  }, [
    resumeLoaded,
    screen,
    mode,
    blockSize,
    subjectFilter,
    started,
    finished,
    showReview,
    reviewMode,
    selectedQuestions,
    allExamQuestions,
    timeLeft,
    current,
    answers,
    highlights,
    crossedOutChoices,
    flaggedQuestions,
    wasCancelled,
    currentBlockIndex,
    blockTransition,
    calculatorOpen,
    labsOpen,
  ]);

  useEffect(() => {
    if (!started || finished || blockTransition || screen !== "test") return;
    if (timeLeft <= 0) {
      finishCurrentBlock(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, timeLeft, blockTransition, screen]);

  const currentQuestion = selectedQuestions[current];

  const progress = useMemo(() => {
    if (!selectedQuestions.length) return 0;
    return ((current + 1) / selectedQuestions.length) * 100;
  }, [current, selectedQuestions]);

  const score = allExamQuestions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.answer ? 1 : 0);
  }, 0);

  const missedQuestions = allExamQuestions.filter(
    (q) => answers[q.id] !== q.answer
  );

  const reviewQuestions =
    reviewMode === "missed" ? missedQuestions : allExamQuestions;

  const actualCustomBlockCount = Math.min(blockSize, filteredQuestions.length);

  const answeredCountCurrentBlock = selectedQuestions.filter(
    (q) => answers[q.id] != null
  ).length;
  const unansweredCountCurrentBlock =
    selectedQuestions.length - answeredCountCurrentBlock;
  const flaggedCountCurrentBlock = selectedQuestions.filter(
    (q) => flaggedQuestions[q.id]
  ).length;

  function buildInitialQuestionState(questions) {
    const initialHighlights = {};
    const initialCrossouts = {};
    const initialFlags = {};

    questions.forEach((q) => {
      initialHighlights[q.id] = [];
      initialCrossouts[q.id] = {};
      initialFlags[q.id] = false;
    });

    return { initialHighlights, initialCrossouts, initialFlags };
  }

  function getBlockQuestions(examQuestions, blockIndex) {
    const start = blockIndex * FULL_EXAM_BLOCK_SIZE;
    const end = start + FULL_EXAM_BLOCK_SIZE;
    return examQuestions.slice(start, end);
  }

  const saveAttempt = (cancelled) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      mode,
      score,
      total: allExamQuestions.length,
      subjectFilter,
      blockSize: mode === "full" ? "Full exam" : selectedQuestions.length,
      cancelled,
      unanswered: allExamQuestions.filter((q) => answers[q.id] == null).length,
      flagged: allExamQuestions.filter((q) => flaggedQuestions[q.id]).length,
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
    if (mode === "custom") {
      const shuffled = shuffleArray(filteredQuestions);
      const chosen = shuffled.slice(0, actualCustomBlockCount);
      const { initialHighlights, initialCrossouts, initialFlags } =
        buildInitialQuestionState(chosen);

      setAllExamQuestions(chosen);
      setSelectedQuestions(chosen);
      setHighlights(initialHighlights);
      setCrossedOutChoices(initialCrossouts);
      setFlaggedQuestions(initialFlags);
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setShowReview(false);
      setReviewMode("all");
      setWasCancelled(false);
      setBlockTransition(false);
      setCurrentBlockIndex(0);
      setTimeLeft(chosen.length * 90);
      setStarted(true);
      setCalculatorOpen(false);
      setLabsOpen(false);
      setScreen("test");
      return;
    }

    const shuffled = shuffleArray(filteredQuestions);
    const examQuestions = shuffled;
    const firstBlock = getBlockQuestions(examQuestions, 0);
    const { initialHighlights, initialCrossouts, initialFlags } =
      buildInitialQuestionState(examQuestions);

    setAllExamQuestions(examQuestions);
    setSelectedQuestions(firstBlock);
    setHighlights(initialHighlights);
    setCrossedOutChoices(initialCrossouts);
    setFlaggedQuestions(initialFlags);
    setAnswers({});
    setCurrent(0);
    setFinished(false);
    setShowReview(false);
    setReviewMode("all");
    setWasCancelled(false);
    setBlockTransition(false);
    setCurrentBlockIndex(0);
    setTimeLeft(firstBlock.length * 90);
    setStarted(true);
    setCalculatorOpen(false);
    setLabsOpen(false);
    setScreen("test");
  };

  const resetToHome = () => {
    setStarted(false);
    setFinished(false);
    setShowReview(false);
    setReviewMode("all");
    setSelectedQuestions([]);
    setAllExamQuestions([]);
    setHighlights({});
    setCrossedOutChoices({});
    setFlaggedQuestions({});
    setAnswers({});
    setCurrent(0);
    setTimeLeft(0);
    setWasCancelled(false);
    setCurrentBlockIndex(0);
    setBlockTransition(false);
    setCalculatorOpen(false);
    setLabsOpen(false);
    setScreen("home");
    clearActiveSession();
  };

  const cancelTest = () => {
    const confirmed = window.confirm(
      "End the test now? Any unanswered questions will be counted as incorrect."
    );
    if (!confirmed) return;
    setWasCancelled(true);
    setFinished(true);
    setShowReview(false);
    setCalculatorOpen(false);
    setLabsOpen(false);
  };

  useEffect(() => {
    if (!finished || !started) return;
    saveAttempt(wasCancelled);
    clearActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const chooseAnswer = (letter) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: letter,
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const goToNextQuestion = () => {
    if (current < selectedQuestions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setScreen("summary");
      setCalculatorOpen(false);
      setLabsOpen(false);
    }
  };

  const prevQuestion = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const confirmBeforeSubmit = () => {
    if (unansweredCountCurrentBlock === 0) {
      finishCurrentBlock(false);
      return;
    }

    const confirmed = window.confirm(
      `You still have ${unansweredCountCurrentBlock} unanswered question${
        unansweredCountCurrentBlock === 1 ? "" : "s"
      }. Submit anyway?`
    );

    if (confirmed) finishCurrentBlock(false);
  };

  const finishCurrentBlock = (forceCancelled) => {
    const cancelled = forceCancelled || false;

    if (mode === "custom") {
      if (cancelled) setWasCancelled(true);
      setFinished(true);
      setShowReview(false);
      return;
    }

    const isLastBlock = currentBlockIndex >= totalExamBlocks - 1;

    if (cancelled) {
      setWasCancelled(true);
      setFinished(true);
      setShowReview(false);
      return;
    }

    if (isLastBlock) {
      setFinished(true);
      setShowReview(false);
      return;
    }

    setBlockTransition(true);
    clearActiveSession();
  };

  const startNextBlock = () => {
    const nextBlockIndex = currentBlockIndex + 1;
    const nextBlockQuestions = getBlockQuestions(allExamQuestions, nextBlockIndex);

    setCurrentBlockIndex(nextBlockIndex);
    setSelectedQuestions(nextBlockQuestions);
    setCurrent(0);
    setTimeLeft(nextBlockQuestions.length * 90);
    setBlockTransition(false);
    setCalculatorOpen(false);
    setLabsOpen(false);
    setScreen("test");
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

  useEffect(() => {
    if (screen !== "test" || !currentQuestion) return;

    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping =
        tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;

      if (isTyping) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();
      const optionLetters = Object.keys(currentQuestion.options || {}).map((x) =>
        x.toUpperCase()
      );

      if (["A", "B", "C", "D", "E", "F"].includes(key) && optionLetters.includes(key)) {
        e.preventDefault();
        chooseAnswer(key);
        return;
      }

      if (key === "[" ) {
        e.preventDefault();
        prevQuestion();
        return;
      }

      if (key === "]") {
        e.preventDefault();
        if (current < selectedQuestions.length - 1) {
          goToNextQuestion();
        } else {
          setScreen("summary");
          setCalculatorOpen(false);
          setLabsOpen(false);
        }
        return;
      }

      if (key === "F" && !optionLetters.includes("F")) {
        e.preventDefault();
        toggleFlag();
        return;
      }

      if (key === "S") {
        e.preventDefault();
        setScreen("summary");
        setCalculatorOpen(false);
        setLabsOpen(false);
        return;
      }

      if (key === "L") {
        e.preventDefault();
        setLabsOpen((prev) => !prev);
        return;
      }

      if (key === "C" && !optionLetters.includes("C")) {
        e.preventDefault();
        setCalculatorOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, currentQuestion, current, selectedQuestions.length]);

  if (!resumeLoaded) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Loading…</h1>
        </div>
      </div>
    );
  }

  if (screen === "home") {
    return (
      <div style={styles.page}>
        <div style={styles.heroCard}>
          <h1 style={styles.heroTitle}>ChatGPT USMLE</h1>
          <p style={styles.heroSubtitle}>
            Build Free 120-style timed blocks, full-length exams, review misses,
            and track recent performance.
          </p>

          <div style={styles.controlsGrid}>
            <div style={styles.controlBox}>
              <label style={styles.label}>Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={styles.select}
              >
                <option value="custom">Custom Block</option>
                <option value="full">Full Exam</option>
              </select>
            </div>

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

            {mode === "custom" && (
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
            )}
          </div>

          <p style={styles.info}>
            Available after filter: <strong>{filteredQuestions.length}</strong>
          </p>

          {mode === "custom" ? (
            <p style={styles.info}>
              This block will contain <strong>{actualCustomBlockCount}</strong>{" "}
              question{actualCustomBlockCount === 1 ? "" : "s"} • Timer:{" "}
              <strong>{formatTime(actualCustomBlockCount * 90)}</strong>
            </p>
          ) : (
            <p style={styles.info}>
              Full Exam mode uses all filtered questions in fixed{" "}
              <strong>40-question blocks</strong>. Final block contains the
              remainder. Score is shown <strong>only at the end</strong>.
            </p>
          )}

          <div style={styles.buttonRow}>
            <button
              onClick={startTest}
              style={{
                ...styles.primaryButton,
                ...(filteredQuestions.length === 0 ? styles.disabledButton : {}),
              }}
              disabled={filteredQuestions.length === 0}
            >
              {mode === "custom" ? "Start New Block" : "Start Full Exam"}
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
                    <span>Mode: {attempt.mode === "full" ? "Full exam" : "Custom block"}</span>
                    <span>Subject: {attempt.subjectFilter}</span>
                    <span>Block: {attempt.blockSize}</span>
                    <span>Status: {attempt.cancelled ? "Cancelled early" : "Completed"}</span>
                    <span>Unanswered: {attempt.unanswered}</span>
                    <span>Flagged: {attempt.flagged}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "summary") {
    return (
      <BlockSummaryPage
        selectedQuestions={selectedQuestions}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        currentQuestionId={selectedQuestions[current]?.id}
        onGoToQuestion={(index) => {
          setCurrent(index);
          setScreen("test");
        }}
        onBack={() => setScreen("test")}
        onSubmit={confirmBeforeSubmit}
        mode={mode}
      />
    );
  }

  if (blockTransition && mode === "full") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Block Complete</h1>
          <p style={styles.info}>
            You finished block <strong>{currentBlockIndex + 1}</strong> of{" "}
            <strong>{totalExamBlocks}</strong>.
          </p>
          <p style={styles.info}>
            No score is shown until the end of the full exam.
          </p>

          <div style={styles.countersRow}>
            <div style={styles.counterBadge}>Answered: {answeredCountCurrentBlock}</div>
            <div style={styles.counterBadge}>Unanswered: {unansweredCountCurrentBlock}</div>
            <div style={styles.counterBadge}>Flagged: {flaggedCountCurrentBlock}</div>
          </div>

          <div style={styles.buttonRow}>
            <button onClick={startNextBlock} style={styles.primaryButton}>
              Start Next Block
            </button>
            <button onClick={cancelTest} style={styles.dangerButton}>
              End Full Exam Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>
            {wasCancelled
              ? mode === "full"
                ? "Full Exam Ended Early"
                : "Test Ended Early"
              : mode === "full"
              ? "Full Exam Complete"
              : "Test Complete"}
          </h1>

          <p style={styles.result}>
            Score: {score} / {allExamQuestions.length}
          </p>

          <p style={styles.info}>
            Time remaining in current block: {formatTime(Math.max(timeLeft, 0))}
          </p>

          <p style={styles.info}>
            Missed: {missedQuestions.length} / {allExamQuestions.length}
          </p>

          <p style={styles.info}>
            Total flagged: {allExamQuestions.filter((q) => flaggedQuestions[q.id]).length} / {allExamQuestions.length}
          </p>

          {mode === "full" && (
            <p style={styles.info}>
              Blocks completed:{" "}
              <strong>
                {wasCancelled ? currentBlockIndex + 1 : totalExamBlocks}
              </strong>{" "}
              / <strong>{totalExamBlocks}</strong>
            </p>
          )}

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
              reviewQuestions.map((q, idx) => {
                const imageSrc = getQuestionImageSrc(q);
                return (
                  <div key={q.id} style={styles.reviewCard}>
                    <div style={styles.reviewHeaderRow}>
                      <h2 style={styles.reviewTitle}>
                        Question {idx + 1} • {q.subject}
                      </h2>
                      {flaggedQuestions[q.id] && (
                        <span style={styles.flagPill}>Flagged</span>
                      )}
                    </div>

                    <InlineStemWithImage
                      stem={q.stem}
                      image={imageSrc}
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
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  const currentImageSrc = getQuestionImageSrc(currentQuestion);
  const currentIsFlagged = flaggedQuestions[currentQuestion.id];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topRow}>
          <button onClick={resetToHome} style={styles.secondaryButton}>
            Home
          </button>

          <div style={styles.topRightActions}>
            <button
              onClick={() => setLabsOpen((prev) => !prev)}
              style={labsOpen ? styles.activeUtilityButton : styles.secondaryButton}
            >
              {labsOpen ? "Hide Labs" : "Labs"}
            </button>
            <button
              onClick={() => setCalculatorOpen((prev) => !prev)}
              style={
                calculatorOpen ? styles.activeUtilityButton : styles.secondaryButton
              }
            >
              {calculatorOpen ? "Hide Calculator" : "Calculator"}
            </button>
            <button onClick={cancelTest} style={styles.dangerButton}>
              {mode === "full" ? "End Full Exam" : "Cancel Test"}
            </button>
          </div>
        </div>

        <QuestionNavigator
          selectedQuestions={selectedQuestions}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          current={current}
          onGoToQuestion={setCurrent}
          collapsed={navigatorCollapsed}
          setCollapsed={setNavigatorCollapsed}
          filter={navigatorFilter}
          setFilter={setNavigatorFilter}
        />

        <h2 style={styles.questionHeader}>
          Question {current + 1} of {selectedQuestions.length}
        </h2>

        {mode === "full" && (
          <p style={styles.info}>
            Block {currentBlockIndex + 1} of {totalExamBlocks}
          </p>
        )}

        <p style={styles.timer}>Time left: {formatTime(Math.max(timeLeft, 0))}</p>

        <div style={styles.countersRow}>
          <div style={styles.counterBadge}>Answered: {answeredCountCurrentBlock}</div>
          <div style={styles.counterBadge}>Unanswered: {unansweredCountCurrentBlock}</div>
          <div style={styles.counterBadge}>Flagged: {flaggedCountCurrentBlock}</div>
        </div>

        <div style={styles.keyboardHint}>
          Shortcuts: A–F answer • [ previous • ] next • S summary • L labs • C calculator
        </div>

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
            <button
              onClick={toggleFlag}
              style={currentIsFlagged ? styles.flaggedButton : styles.secondaryButton}
            >
              {currentIsFlagged ? "Unflag Question" : "Flag Question"}
            </button>
            <button onClick={clearHighlights} style={styles.secondaryButton}>
              Clear Highlights
            </button>
            <button onClick={clearCrossouts} style={styles.secondaryButton}>
              Clear Crossouts
            </button>
            <button onClick={() => setScreen("summary")} style={styles.secondaryButton}>
              Summary
            </button>
          </div>
        </div>

        <InlineStemWithImage
          stem={currentQuestion.stem}
          image={currentImageSrc}
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

          <button
            onClick={
              current < selectedQuestions.length - 1
                ? goToNextQuestion
                : () => setScreen("summary")
            }
            style={styles.primaryButton}
          >
            {current < selectedQuestions.length - 1 ? "Next" : "Review Block"}
          </button>
        </div>
      </div>

      {screen === "test" && (
        <>
          <FloatingLabs
            isOpen={labsOpen}
            onClose={() => setLabsOpen(false)}
            position={labsPos}
            setPosition={setLabsPos}
            minimized={labsMinimized}
            setMinimized={setLabsMinimized}
          />
          <FloatingCalculator
            isOpen={calculatorOpen}
            onClose={() => setCalculatorOpen(false)}
            position={calculatorPos}
            setPosition={setCalculatorPos}
            minimized={calculatorMinimized}
            setMinimized={setCalculatorMinimized}
          />
        </>
      )}
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
    background: "linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)",
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
    gap: "12px",
    flexWrap: "wrap",
  },
  topRightActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
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
  navigatorContainer: {
    marginBottom: "18px",
  },
  navigatorHeader: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px",
  },
  navigatorHeaderLeft: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  navigatorFilterSelect: {
    padding: "10px 14px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "white",
  },
  navigatorWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "center",
  },
  navigatorButton: {
    minWidth: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontWeight: "bold",
  },
  navigatorAnswered: {
    backgroundColor: "#dcfce7",
  },
  navigatorUnanswered: {
    backgroundColor: "#fee2e2",
  },
  navigatorFlagged: {
    border: "2px solid #f59e0b",
  },
  navigatorCurrent: {
    outline: "2px solid #2563eb",
    outlineOffset: "2px",
  },
  questionHeader: {
    textAlign: "center",
    marginBottom: "8px",
  },
  timer: {
    textAlign: "center",
    color: "#555",
    marginBottom: "12px",
    fontSize: "1.1rem",
  },
  keyboardHint: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.9rem",
    marginBottom: "12px",
  },
  countersRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  counterBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    fontSize: "0.95rem",
    color: "#3730a3",
    fontWeight: "bold",
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
    margin: "16px 0",
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
  activeUtilityButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #1d4ed8",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
  },
  flaggedButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #f59e0b",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
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
  reviewHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  reviewTitle: {
    marginTop: 0,
    marginBottom: "8px",
  },
  flagPill: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: "999px",
    padding: "6px 12px",
    fontWeight: "bold",
    fontSize: "0.9rem",
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
  draggablePanel: {
    position: "fixed",
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "16px",
    padding: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
    zIndex: 950,
    maxHeight: "72vh",
    overflowY: "auto",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    cursor: "move",
    userSelect: "none",
  },
  panelHeaderButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  panelCloseButton: {
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  labsAccordion: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  labsSectionHeader: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#f3f4f6",
    textAlign: "left",
    fontWeight: "bold",
    cursor: "pointer",
  },
  labsSectionContent: {
    padding: "10px 6px 4px 6px",
  },
  labRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "6px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "0.95rem",
  },
  calculatorDisplay: {
    minHeight: "56px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "1.3rem",
    marginBottom: "16px",
    backgroundColor: "#f9fafb",
    wordBreak: "break-all",
  },
  calculatorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
  },
  calcButton: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    fontSize: "1rem",
    cursor: "pointer",
  },
  calcEqualsButton: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
  },
  summaryLegend: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#555",
  },
  summaryChip: {
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    display: "inline-block",
  },
  summaryAnswered: {
    backgroundColor: "#dcfce7",
  },
  summaryUnanswered: {
    backgroundColor: "#fee2e2",
  },
  summaryFlagged: {
    backgroundColor: "#fef3c7",
  },
  summaryCurrent: {
    backgroundColor: "#dbeafe",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  summaryQuestionButton: {
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid #ddd",
    cursor: "pointer",
    textAlign: "left",
    backgroundColor: "white",
  },
  summaryQuestionNumber: {
    fontWeight: "bold",
    marginBottom: "6px",
  },
  summaryQuestionStatus: {
    fontSize: "0.9rem",
    color: "#555",
  },
  summaryFlaggedBorder: {
    border: "2px solid #f59e0b",
  },
  summaryCurrentOutline: {
    outline: "2px solid #2563eb",
    outlineOffset: "2px",
  },
};