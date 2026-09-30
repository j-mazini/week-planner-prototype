"use client";
import type { ReactNode } from "react";
import Modal from "../../../components/Modal";
import "./reference-modals.css";

interface RouteBalanceModalProps {
  title: string;
  wide?: boolean;
  variant?: "form" | "postcode" | "shipment" | "stops" | "special";
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}
export default function RouteBalanceModal({ title, wide, variant = "form", onClose, footer, children }: RouteBalanceModalProps) {
  return <Modal title={title} onClose={onClose} footer={footer}
    classes={{ overlay: "rbf-scrim rbm-scrim", panel: `rbf-dlg rbm-panel rbm-${variant}${wide ? " rbm-wide" : ""}`, header: "rbf-dlghd rbm-header", body: "rbf-dlgbody rbm-body", footer: "rbf-dlgft rbm-footer", close: "rbm-close" }}>
    {children}
  </Modal>;
}
