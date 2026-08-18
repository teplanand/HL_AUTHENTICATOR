import { createRef } from "react";

import ApiActionButton from "../../../../shared/components/common/ApiActionButton";

type SubmitRef = {
  submit: () => Promise<void>;
};

type OpenEntityFormModalOptions<TRef extends SubmitRef> = {
  openModal: (params: any) => void;
  entityLabel: string;
  width: number | string;
  FormComponent: any;
  defaultValues?: Record<string, any>;
  extraProps?: Record<string, unknown>;
};

export const openEntityFormModal = <TRef extends SubmitRef>({
  openModal,
  entityLabel,
  width,
  FormComponent,
  defaultValues,
  extraProps,
}: OpenEntityFormModalOptions<TRef>) => {
  const formRef = createRef<TRef>();
  const isEditMode = Boolean(defaultValues && Object.keys(defaultValues).length > 0);

  openModal({
    title: `${isEditMode ? "Edit" : "Add"} ${entityLabel}`,
    width,
    showCloseButton: true,
    askDataChangeConfirm: false,
    defaultValues,
    component: (modalProps: any) => (
      <FormComponent
        ref={formRef}
        {...modalProps}
        {...extraProps}
        defaultValues={defaultValues}
      />
    ),
    action: (
      <ApiActionButton onApiCall={() => formRef.current?.submit?.() ?? Promise.resolve()}>
        {isEditMode ? "Save Changes" : "Save"}
      </ApiActionButton>
    ),
  });
};
