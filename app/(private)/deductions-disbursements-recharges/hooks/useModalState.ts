'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import type { DisplayDeduction, FormDataState } from '../types';
import { getInitialFormState } from '../formState';

export const useModalState = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalEntryType, setModalEntryType] = useState('');
  const [editingItem, setEditingItem] = useState<DisplayDeduction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataState>(() => getInitialFormState());
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetFormState = useCallback(() => {
    setFormData(getInitialFormState());
    setSelectedCategory('');
    setUploadedFiles([]);
    setCurrentStep(1);
    setValidationAttempted(false);
    setEditingItem(null);
  }, []);

  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  // Fecha a sidebar quando o modal é aberto (backup via useEffect)
  useEffect(() => {
    if (showModal) {
      if (isMobile) setOpenMobile(false);
      setOpen(false);
    }
  }, [showModal, isMobile, setOpen, setOpenMobile]);

  const handleOpenModal = useCallback((type?: string, skipReset = false) => {
    // Fecha a sidebar imediatamente antes de abrir o modal
    if (isMobile) setOpenMobile(false);
    setOpen(false);

    if (!skipReset && !editingItem) {
      setEditingItem(null);
    }
    
    if (!skipReset) {
      const nextState = getInitialFormState();
      if (type) {
        nextState.type = type;
      }
      setFormData(nextState);
      setSelectedCategory(type || '');
      setUploadedFiles([]);
      setCurrentStep(1);
      setValidationAttempted(false);
    } else if (type) {
      setSelectedCategory(type);
    }

    if (type) {
      setModalEntryType(type);
    }
    setShowModal(true);
  }, [editingItem, isMobile, setOpen, setOpenMobile]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    resetFormState();
  }, [resetFormState]);

  return {
    showModal,
    setShowModal,
    modalEntryType,
    setModalEntryType,
    editingItem,
    setEditingItem,
    selectedCategory,
    setSelectedCategory,
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    uploadedFiles,
    setUploadedFiles,
    isDragOver,
    setIsDragOver,
    validationAttempted,
    setValidationAttempted,
    fileInputRef,
    resetFormState,
    handleOpenModal,
    handleCloseModal,
  };
};

