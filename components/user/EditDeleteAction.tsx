"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ROUTES from "@/constants/routes";
import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/question.action";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
    type: "question" | "answer";
    itemId: string;
}

const EditDeleteAction = ({ type, itemId }: Props) => {
    const router = useRouter();
    const handleEdit = async () => {
        router.push(ROUTES.EDIT_QUESTION(itemId));
    };
    const handleDelete = async () => {
        if (type === "question") {
            await deleteQuestion({ questionId: itemId });
            toast("Question deleted successfully");
        } else if (type === "answer") {
            await deleteAnswer({ answerId: itemId });
            toast("Answer deleted successfully");
        }
    };
    return (
        <div
            className={`flex items-center justify-end gap-3 max-sm:w-full ${type === "answer" && "gap-0 justify-center"}`}
        >
            {type === "question" && (
                <Image
                    src="/icons/edit.svg"
                    alt="edit"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                    onClick={handleEdit}
                />
            )}
            <AlertDialog>
                <AlertDialogTrigger className="cursor-pointer">
                    <Image
                        src="/icons/trash.svg"
                        alt="delete"
                        width={20}
                        height={20}
                        className="cursor-pointer"
                    />
                </AlertDialogTrigger>
                <AlertDialogContent className="background-light800_dark300">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your {type} and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="btn">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="!border-primary-100 !bg-primary-500 !text-light-800"
                            onClick={handleDelete}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EditDeleteAction;
