import { db } from "@/lib/firebase/firebase";
import { WorkSpaceType } from "@/types/WorkSpaceType";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { getUserData, setUserData } from "./user";
import {
    FireStoreCollectionFields,
    FireStoreCollections,
} from "@/constants/FirebaseConstants";

export const getWorkSpaces = async (uid: string): Promise<WorkSpaceType[]> => {
    const q = query(
        collection(db, FireStoreCollections.WORKSPACES),
        where(
            FireStoreCollectionFields.WORKSPACES.MEMBERS,
            "array-contains",
            uid,
        ),
    );
    const querySnapshot = await getDocs(q);
    const workSpaces: WorkSpaceType[] = [];
    querySnapshot.forEach((doc) => {
        workSpaces.push({
            id: doc.id,
            name: doc.data().name,
            members: doc.data().members,
            icon_unified: doc.data().icon_unified,
        });
    });
    return workSpaces;
};

export const addWorkSpace = async (
    workSpace: WorkSpaceType,
    uid: string,
): Promise<string> => {
    const workSpaceRef = collection(db, FireStoreCollections.WORKSPACES);
    const docRef = await addDoc(workSpaceRef, workSpace);

    const userData = (await getUserData(uid)) || {};
    if (!userData.workSpaceOrder) {
        userData.workSpaceOrder = [];
    }
    userData.workSpaceOrder.push(docRef.id);
    await setUserData(userData.workSpaceOrder, uid);
    return docRef.id;
};

export const onSnapshotWorkSpaces = (callback: () => void, uid: string) => {
    const q = query(
        collection(db, FireStoreCollections.WORKSPACES),
        where(
            FireStoreCollectionFields.WORKSPACES.MEMBERS,
            "array-contains",
            uid,
        ),
    );
    return onSnapshot(q, () => {
        callback();
    });
};

export const editWorkSpace = async (
    workspaceId: string,
    workspaceName?: string,
    workSpaceTcon_unified?: string,
    members?: string[],
) => {
    const workspaceRef = doc(db, FireStoreCollections.WORKSPACES, workspaceId);

    const editedWorkspace: Partial<WorkSpaceType> = {};
    if (workspaceName) {
        editedWorkspace.name = workspaceName;
    }
    if (workSpaceTcon_unified) {
        editedWorkspace.icon_unified = workSpaceTcon_unified;
    }
    if (members) {
        editedWorkspace.members = members;
    }
    return updateDoc(workspaceRef, editedWorkspace);
};

export const removeWorkSpace = async (workspaceId: string, uid: string) => {
    const workspaceRef = doc(db, FireStoreCollections.WORKSPACES, workspaceId);
    const userData = (await getUserData(uid)) || {};
    if (!userData.workSpaceOrder) {
        userData.workSpaceOrder = [];
    }
    userData.workSpaceOrder = userData.workSpaceOrder.filter(
        (id: string) => id !== workspaceId,
    );
    await setUserData(userData.workSpaceOrder, uid);
    return deleteDoc(workspaceRef);
};

export const getWorkSpace = async (workspaceId: string) => {
    const workspaceRef = doc(db, FireStoreCollections.WORKSPACES, workspaceId);
    const docSnap = await getDoc(workspaceRef);
    if (docSnap.exists()) {
        return docSnap.data() as WorkSpaceType;
    } else {
        throw new Error("Workspace not found");
    }
};
