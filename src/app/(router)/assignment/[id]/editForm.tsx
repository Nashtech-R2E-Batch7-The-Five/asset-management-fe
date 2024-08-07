/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import React, { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from "@providers/loading";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";
import { updateAssignment } from "@services/assignment";
import { toast } from "react-toastify";
import { IAssignmentEditForm } from "../../../../types/assignment.type";
import { Asset, Assignment, UpdateAssignmentInput, User } from "../../../../__generated__/graphql";
import { usePushUp } from "../pushUp";
import { ASSIGNMENT_PATH_DEFAULT } from "../../../../constants";
import { validationSchema } from "../create/schema";
import ModalUserPicker from "../modal/modalPickUser";
import ModalAssetPicker from "../modal/modalPickAsset";

interface FormProps {
  setShowModalConfirm: (value: boolean) => void;
  assignment: Assignment | undefined;
}

const EditForm: FC<FormProps> = (props) => {
  const { setShowModalConfirm, assignment } = props;
  const { setLoading }: any = useLoading();
  const { pushUp }: any = usePushUp();

  const route = useRouter();

  const [openModalUser, setOpenModalUser] = useState(false);
  const [openModalAsset, setOpenModalAsset] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);

  const [userSelected, setUserSelected] = useState<User>();
  const [assetSelected, setAssetSelected] = useState<Asset>();
  const [noteValue, setNoteValue] = useState<string>("");

  const [dataUpdate, setDataUpdate] = useState<IAssignmentEditForm | null>(
    null
  );

  useEffect(() => {
    if (assignment) {
      setUserSelected(assignment.assignee);
      setAssetSelected(assignment.asset);
      setNoteValue(assignment?.note || "");
      setDataUpdate({
        assignedDate: new Date(assignment?.assignedDate).toISOString().slice(0, 10),
        note: assignment.note || "",
        user: assignment.assignee,
        asset: assignment.asset
      });
    }
  }, [assignment]);

  useEffect(() => {
    if (dataUpdate) {
      form.reset(dataUpdate);
    }
  }, [dataUpdate]);

  const form = useForm({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: dataUpdate || {
      asset: null,
      user: null,
      assignedDate: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  const allFieldsFilled =
    !!userSelected && !!assetSelected && !!form.watch("assignedDate");

  const onSubmit = async (value: IAssignmentEditForm) => {
    if (submissionInProgress) return;
    setSubmissionInProgress(true);
    setLoading(true);
    const variables: UpdateAssignmentInput = {
      assetCode: assetSelected?.assetCode || "",
      assetName: assetSelected?.assetName || "",
      assetId:
        assetSelected?.id !== assignment?.asset.id
          ? parseInt(assetSelected?.id as string)
          : undefined,
      assignedToId: parseInt(userSelected?.id as string),
      assignedToUsername: userSelected?.username || "",
      assignedDate: value.assignedDate || assignment?.assignedDate,
      note: noteValue || "",
    };
    console.log(variables)
    const data = await updateAssignment(
      assignment?.id as number,
      variables
    );

    if (data) {
      pushUp(data?.id);
      setLoading(false);
      toast.success("Assignment update success");
      route.push(ASSIGNMENT_PATH_DEFAULT);
    }
  };
  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="user"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center gap-5 cursor-pointer">
                <FormLabel className="w-[120px]">User <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Button
                    id="select-user-assignment"
                    type="button"
                    variant="outline"
                    className="w-full flex justify-start"
                    onClick={() => setOpenModalUser(true)}>
                    {userSelected
                      ? userSelected.lastName + " " + userSelected.firstName
                      : ""}
                  </Button>
                </FormControl>
              </div>
              <ModalUserPicker
                isOpen={openModalUser}
                setOpenModal={setOpenModalUser}
                setUserSelected={setUserSelected}
              />
              <FormMessage className="text-gradient float-left ml-26">
                {fieldState.error?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="asset"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center gap-5 cursor-pointer">
                <FormLabel className="w-[120px]">Asset <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Button
                    id="select-asset-assignment"
                    type="button"
                    variant="outline"
                    className="w-full flex justify-start"
                    onClick={() => setOpenModalAsset(true)}>
                    {assetSelected ? assetSelected.assetName : ""}
                  </Button>
                </FormControl>
              </div>
              <ModalAssetPicker
                isOpen={openModalAsset}
                setOpenModal={setOpenModalAsset}
                setAssetSelected={setAssetSelected}
              />
              <FormMessage className="text-nashtech float-left ml-26">
                {fieldState.error?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignedDate"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel className="w-[150px]">Assigned Date <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    id="assigned-date-assignment-edit"
                    placeholder="Select a date"
                    {...field}
                    
                    type="date"
                    className={`flex justify-end cursor-pointer flex-col ${
                      fieldState.error ? "border-nashtech" : ""
                    }`}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-nashtech float-left ml-26">
                {fieldState.error?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        <div className="flex flex-row justify-between items-start w-full gap-20">
          <label>Note</label>
          <textarea
            onChange={(e) => setNoteValue(e.target.value)}
            value={noteValue}
            id="note-assignment"
            maxLength={200}
            rows={5}
            className="flex h-auto w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="float-right">
          <Button
            id="save-btn-assignment"
            type="submit"
            className="bg-custom-gradient text-white mr-4 cursor-pointer"
            disabled={!allFieldsFilled}>
            Save
          </Button>
          <Button
            id="cancel-btn-assignment"
            onClick={() => setShowModalConfirm(true)}
            type="button"
            variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditForm;