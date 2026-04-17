export const navLinks = [
  { label: "Accueil", href: "#" },
  { label: "À Propos", href: "#about" },
  { label: "Élections", href: "#elections" },
  { label: "FAQs", href: "#faqs" },
  { label: "Contact", href: "#contact" },
];

export const stats = [
  { value: "99.9%", label: "Disponibilité", color: "text-primary-container" },
  { value: "2M+", label: "Électeurs Inscrits", color: "text-white" },
  { value: "0", label: "Failles de sécurité", color: "text-secondary-fixed" },
  { value: "100%", label: "Anonymat Garanti", color: "text-white" },
];

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
}

export const features: Feature[] = [
  {
    icon: "security",
    title: "Sécurité Blockchain",
    desc: "Chaque vote est crypté et enregistré sur un registre inaltérable distribué sur plusieurs nœuds sécurisés.",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    hoverBorder: "hover:border-b-primary-container",
  },
  {
    icon: "fingerprint",
    title: "Authentification Biométrique",
    desc: "Validation multi-facteurs incluant la reconnaissance faciale pour éliminer toute tentative de fraude.",
    iconBg: "bg-secondary-container",
    iconColor: "text-secondary",
    hoverBorder: "hover:border-b-secondary",
  },
  {
    icon: "query_stats",
    title: "Audit en Temps Réel",
    desc: "Outils de monitoring pour les observateurs électoraux garantissant une transparence totale.",
    iconBg: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    hoverBorder: "hover:border-b-tertiary",
  },
  {
    icon: "devices",
    title: "Accessibilité Totale",
    desc: "Compatible avec tous les smartphones et tablettes, même avec une connexion internet limitée.",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    hoverBorder: "hover:border-b-primary-container",
  },
  {
    icon: "visibility_off",
    title: "Anonymat Absolu",
    desc: "Séparation cryptographique entre l'identité de l'électeur et son bulletin de vote numérique.",
    iconBg: "bg-secondary-container",
    iconColor: "text-secondary",
    hoverBorder: "hover:border-b-secondary",
  },
  {
    icon: "support_agent",
    title: "Support 24/7",
    desc: "Une assistance multilingue (Français et langues locales) pour guider chaque citoyen.",
    iconBg: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    hoverBorder: "hover:border-b-tertiary",
  },
];

export interface Step {
  num: string;
  label: string;
  title: string;
  desc: string;
  bg: string;
}

export const steps: Step[] = [
  {
    num: "1",
    label: "bg-primary-container",
    title: "Identification",
    desc: "Connectez-vous via votre numéro de carte d'électeur et passez la validation faciale.",
    bg: "#f77f00",
  },
  {
    num: "2",
    label: "bg-[#C16D00]",
    title: "Choix de l'Élection",
    desc: "Sélectionnez le scrutin auquel vous souhaitez participer dans votre circonscription.",
    bg: "#C16D00",
  },
  {
    num: "3",
    label: "bg-[#606E17]",
    title: "Vote Secret",
    desc: "Marquez votre bulletin numérique en toute confidentialité sur votre écran.",
    bg: "#606E17",
  },
  {
    num: "4",
    label: "bg-secondary",
    title: "Validation Blockchain",
    desc: "Recevez votre reçu cryptographique unique prouvant que votre vote a été compté.",
    bg: "#006e2e",
  },
];

export const footerProduct = ["Comment voter", "Sécurité", "Audit blockchain"];
export const footerLegal = [
  "Confidentialité",
  "Mentions Légales",
  "Conditions d'usage",
];

export const heroAvatarUrls = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuALlATiiKCHYQCLAiDa2hYmYdZsxtgOY3fPIioalMIQlqOk1iesAdKcba7Ub1TYycaxL8ukhZ-1wFID_Yv7S9rZ9EokOYiSXICVMpqYQPkn_nOua898fNTNJv-7wnWG7_hIqEQAnR9QcO9tcvvvjE7wD_BRff7z5ycrIKPZAXMLUOPpH0GuiIGJG177wjyb-XEU_sMBwNfLJCOi8jWm_2386sQjeie-gIkl74UlFJbmE-8NaDpwxbkPZojMrWk3yacX22PaGkOh3Uw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAkAhqXSO-aS33VBGIqC4MHVd7o9nqIRC4iULzosWNJkg0dDJmcjKLu-CQwuh_8PgN8t9Vdc7To_sk03nho7mMHx-cHIIZcQR033NMHOIeXCQPgoFvwTi9ver9NcOH5jY-Vb2u7RlrVHz-zo3Dk9LlMqH_pVtxQyyFc2pn2_LSx0shmyJXpOuVv3pEmzqESCaMysHL18AazpYGbYkjyYikIOY8ySEpxnIjy14tpI-24S1WSbnTFcYJXXmnP-lmgX0YDTCL58JW5k0M",
];
