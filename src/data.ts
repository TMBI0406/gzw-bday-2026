/* ==========================================================================
   ALLE INHALTE DER SEITE
   Hier kannst du Texte, Fotos und Videos austauschen, ohne den Layout-Code
   anfassen zu müssen.
   - Eigene Fotos:  in /public/photos/ legen und z.B. "/photos/klassenfahrt.jpg" eintragen
   - Eigene Videos: in /public/videos/ legen und z.B. "/videos/gruss.mp4" eintragen
   ========================================================================== */

// ---------- Typen ----------------------------------------------------------

export type ModalKey = "report" | "gallery" | "projector" | "mirror" | "gift" | "board";

export interface Subject {
  subject: string;
  grade: string;
  note?: string;
}

export interface Photo {
  id: string;
  src: string;
  caption: string;
  /** Schiefstand an der Pinnwand in Grad (optional, sonst automatisch) */
  rotate?: number;
}

export interface Video {
  id: string;
  title: string;
  src: string;
  poster?: string;
}

// ---------- Szene 1: Die Tür ----------------------------------------------

export const INTRO = {
  roomNumber: "Raum 1.07",
  signTitle: "Klassenzimmer",
  signName: "Herr Gazwan",
  hint: "Hinter dieser Tür wartet eine Überraschung …",
  enterButton: "Eintreten",
};

// ---------- Szene 2: Das Klassenzimmer ------------------------------------

export const CLASSROOM = {
  greeting: "Alles Gute zum Geburtstag,",
  name: "Gazwan!",
  subline: "Tipp auf einen Gegenstand im Raum.",
  objects: {
    report: { label: "Das Zeugnis", hint: "Deine Noten sind da" },
    gallery: { label: "Die Pinnwand", hint: "Erinnerungen" },
    projector: { label: "Der Fernseher", hint: "" },
    mirror: { label: "Der Spiegel", hint: "Selfie machen" },
    gift: { label: "Das Geschenk", hint: "Für dich!" },
    board: { label: "Die Tafel", hint: "Selbst kritzeln" },
  } satisfies Record<ModalKey, { label: string; hint: string }>,
  /** Hinweis im 3D-Raum (Handy) */
  dragHint: "Wischen zum Umsehen",
  /** Ladebildschirm, falls der 3D-Raum noch lädt */
  loading: "Das Licht wird eingeschaltet …",
};

/** Gesichter der Schüler (Pappaufsteller-Look). Bilder in /public/faces/ legen.
    Reihenfolge = Schüler 1–6. Leerer Text "" = Schüler ohne Foto. */
export const STUDENT_FACES: string[] = [
  "/faces/freund-1.jpg",
  "/faces/freund-2.jpg",
  "/faces/freund-3.jpg",
  "/faces/freund-4.jpg",
  "/faces/freund-5.jpg",
  "/faces/freund-6.jpg",
];

/** Lautstärke-Knopf oben links */
export const SOUND = {
  mute: "Ton aus",
  unmute: "Ton an",
};

/** Geburtstagskuchen auf dem Pult – Antippen pustet die Kerzen aus */
export const CAKE = {
  candles: 5,
  tapHint: "Kerzen auspusten",
  wish: "Wünsch dir was! 🎂",
};

/** Erscheint, sobald alle vier Gegenstände angesehen wurden */
export const FINALE = {
  title: "Danke, dass es dich gibt!",
  text: "Du bist nicht nur ein guter Freund – du bist einer von den ganz Besonderen. Auf ein richtig geiles neues Lebensjahr!",
  signature: "Dein Marcel",
  button: "Weiter umsehen",
};

// ---------- A) Das Zeugnis -------------------------------------------------

export const REPORT_CARD = {
  school: "Städtische Sonderschule",
  title: "Zeugnis",
  recipientPrefix: "für",
  recipient: "Gazwan",
  schoolYear: "Schuljahr 2026/27",
  subjects: [
    { subject: "Loyalität", grade: "1+", note: "Ist immer da, wenn's drauf ankommt" },
    { subject: "Humor", grade: "1+", note: "Auch um 3 Uhr nachts noch witzig" },
    { subject: "Nerven aus Drahtseilen", grade: "1+", note: "Bringt die besoffensten Leute sicher nach Hause" },
    { subject: "Drip", grade: "1+", note: "Dripped too hard" },
    { subject: "Motivation", grade: "1+", note: "Ansteckend" },
  ] satisfies Subject[],
  overallLabel: "Gesamtnote",
  overallGrade: "1+ mit Sternchen",
  remarksTitle: "Bemerkungen",
  remarks: [
    "Gazwan zeigt in allen Bereichen herausragende Leistungen.",
    "Du bist der Freund, den sich jeder wünscht – ehrlich, verlässlich und immer für einen Spaß zu haben.",
    "Danke für jedes Gespräch, jedes Lachen und jede verrückte Idee.",
    "Alles Gute zum Geburtstag!",
  ],
  skipHint: "Tippen zum Überspringen",
  signatureLabel: "Unterschrift",
  signature: "Dein Marcel",
  stamp: "Befördert auf Legenden Status",
};

// ---------- B) Die Pinnwand ------------------------------------------------

export const GALLERY = {
  title: "Unsere Pinnwand",
  subline: "Tipp auf ein Foto, um es näher anzusehen.",
};

export const PHOTOS: Photo[] = [
  // Die ersten 6 hängen im 3D-Raum an der Pinnwand, in der großen Ansicht sieht man alle.
  { id: "p1", src: "/photos/foto-09.jpg", caption: "Die ganze Truppe", rotate: -4 },
  { id: "p2", src: "/photos/foto-07.jpg", caption: "Lagerfeuer-Abend", rotate: 3 },
  { id: "p3", src: "/photos/foto-04.jpg", caption: "Shisha-Abend", rotate: -2 },
  { id: "p4", src: "/photos/foto-02.jpg", caption: "Bro-Moment", rotate: 5 },
  { id: "p5", src: "/photos/foto-01.jpg", caption: "Partynacht", rotate: -3 },
  { id: "p6", src: "/photos/foto-08.jpg", caption: "Alle auf einem Haufen", rotate: 2 },
  { id: "p7", src: "/photos/foto-03.jpg", caption: "Grillen", rotate: -2 },
  { id: "p8", src: "/photos/foto-06.jpg", caption: "Unterwegs", rotate: 4 },
  { id: "p9", src: "/photos/foto-10.jpg", caption: "Im Wald", rotate: -3 },
  { id: "p10", src: "/photos/foto-05.jpg", caption: "Frisch aufgestanden", rotate: 2 },
];

// ---------- D) Der Spiegel überm Waschbecken --------------------------------
// Öffnet am Handy die Kamera (Frontkamera), das Selfie erscheint dann im Spiegel.

export const MIRROR = {
  title: "Spieglein, Spieglein …",
  subline: "… an der Wand, wer ist der beste Lehrer im ganzen Land?",
  emptyText: "Schau mal hinein!",
  takeButton: "Selfie machen",
  retakeButton: "Nochmal",
  shareButton: "Speichern",
  caption: "Der beste Lehrer im ganzen Land 👑",
  processing: "Einen Moment …",
  error: "Das Foto konnte nicht geladen werden. Bitte nochmal versuchen.",
  desktopHint: "Am Handy öffnet sich die Selfie-Kamera.",
};

// ---------- E) Das Geschenk vor dem Pult ----------------------------------

export const GIFT = {
  title: "Ein kleines Geschenk",
  tapHint: "Tippen zum Auspacken",
  voucherLabel: "Gutschein",
  voucherTitle: "Essen auf mein Nacken",
  voucherLines: ["Whenever.", "Wherever.", "Whatever."],
  voucherFine: "Gültig ein Leben lang · Keine Barauszahlung · Nachtisch inklusive",
  from: "Dein Marcel",
  button: "Danke!",
};

// ---------- F) Die Tafel zum Selbstkritzeln -------------------------------

export const BOARD = {
  title: "Die Tafel",
  subline: "Mal mit dem Finger drauf los!",
  clear: "Tafel wischen",
  rotateHint: "Tipp: Handy quer halten für mehr Platz",
  done: "Fertig",
};

// ---------- C) Der Fernseher -----------------------------------------------

export const PROJECTOR = {
  title: "Geschichten aus dem Paulaner Garten",
  subline: "Bitte Ton einschalten.",
  missingVideo: "Dieses Video wurde noch nicht eingelegt.",
  missingVideoHint: "Datei unter public/videos/ ablegen.",
};

export const VIDEOS: Video[] = [
  { id: "v1", title: "Video 1", src: "/videos/video-1.mp4" },
  { id: "v2", title: "Video 2", src: "/videos/video-2.mp4" },
  { id: "v3", title: "Video 3", src: "/videos/video-3.mp4" },
];
