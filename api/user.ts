import { FireStoreCollections } from "@/constants/FirebaseConstants";
import { db } from "@/lib/firebase/firebase";
import { UserDataType } from "@/types/UserDataType";
import { doc, getDoc, setDoc } from "firebase/firestore";


export const setUserData = async (workSpaceOrder: string[], uid: string): Promise<void> => {
    return setDoc(doc(db, FireStoreCollections.USER_DATA, uid), {
        workSpaceOrder
    });
}

export const getUserData = async (uid: string): Promise<UserDataType> => {
    const docRef = doc(db, FireStoreCollections.USER_DATA, uid);
    const docData = await getDoc(docRef)
    const userData = docData.data() as UserDataType
    return userData
}