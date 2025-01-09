import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "./config/firebaseConfig"
import { addDoc, collection, getDocs, updateDoc } from "firebase/firestore";

export const signinWithFirebaseEmail = async ({ email, password }) => {
    try {
        const signIn = await signInWithEmailAndPassword(auth, email, password)
        if (!signIn) {
            return false
        }
        const role = await getRoleByEmail(signIn.user.email)
        return {
            email: signIn.user.email,
            uid: signIn.user.uid,
            role: role
        }
    } catch (error) {
        console.log("Can't sign in", error);
        return false
    }
}

export const signOut = () => {
    return auth.signOut()
}

export const checkSignInStatus = async () => {
    // check user
    const user = auth.currentUser
    if (!user) {
        return false
    }
    const role = await getRoleByEmail(user.email)
    return {
        email: user.email,
        uid: user.uid,
        role: role
    }
}

const getRoleByEmail = async (email) => {
    const querySnapshot = await getDocs(collection(db, "users"));
    let role = false
    querySnapshot.forEach((doc) => {
        if (doc.data().email.toLowerCase() === email) {
            role = doc.data().role
        }
    });

    return role
}

export const getAllUsersFromFirestore = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    let users = []
    querySnapshot.forEach((doc) => {
        users.push(doc.data())
    });
    return users
}
export const createNewUser = async ({ email, password, role }) => {

    try {
        // register new user in auth with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // add user to firestore

        const docRef = await addDoc(collection(db, "users"), {
            email: email.toLowerCase(),
            role: role
        });
        console.log("Document written with ID: ", docRef.id);
        return true
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            console.log("Email already in use");
        } else {
            console.log("Can't sign up", error);
        }
        return false
    }
}

export const updateUserInformation = async ({ email, role }) => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        let userDoc = null;
        querySnapshot.forEach((doc) => {
            if (doc.data().email.toLowerCase() === email.toLowerCase()) {
                userDoc = doc;
            }
        });

        if (!userDoc) {
            console.log("User not found");
            return false;
        }

        await updateDoc(userDoc.ref, { role: role });
        console.log("Role updated successfully");
        return true;
    } catch (error) {
        console.error("Error updating user role:", error);
        return false;
    }
}
