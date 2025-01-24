import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "./config/firebaseConfig"
import { addDoc, collection, getDocs, updateDoc } from "firebase/firestore";

export const signinWithFirebaseEmail = async ({ email, password }) => {
    try {
        const signIn = await signInWithEmailAndPassword(auth, email, password)
        if (!signIn) {
            return false
        }
        const info = await getUserInfoByEmail(signIn.user.email)
        return {
            email: signIn.user.email,
            uid: signIn.user.uid,
            role: info?.role,
            name: info?.name
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
    const info = await getUserInfoByEmail(user.email)
    return {
        email: user.email,
        uid: user.uid,
        role: info?.role,
        name: info?.name
    }
}

const getUserInfoByEmail = async (email) => {
    const querySnapshot = await getDocs(collection(db, "users"));
    let role = false
    let name = false
    querySnapshot.forEach((doc) => {
        if (doc.data().email.toLowerCase() === email) {
            role = doc.data().role
            name = doc.data().name
        }
    });
    return {
        role: role,
        name: name
    }
}

export const getAllUsersFromFirestore = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    let users = []
    querySnapshot.forEach((doc) => {
        users.push(doc.data())
    });
    return users
}
export const createNewUser = async ({ email, password, role, name }) => {

    try {
        // register new user in auth with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // add user to firestore

        const docRef = await addDoc(collection(db, "users"), {
            email: email.toLowerCase(),
            role: role,
            name: name
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
export const updateUserInformation = async ({ email, role, name }) => {
    if (!email) {
        console.log("Email is required.");
        return false;
    }
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        let userDoc = null;
        
        // Check if any user matches the email
        querySnapshot.forEach((doc) => {
            if (doc.data().email.toLowerCase() === email.toLowerCase()) {
                userDoc = doc;
            }
        });

        if (!userDoc) {
            console.log("User not found");
            return false;
        }

        const data = {};

        // Always update the role if provided
        if (role != null) {
            data.role = role;
        }

        // Always update the name if provided
        if (name != null) {
            data.name = name;
        }

        // If no data to update, return false
        if (Object.keys(data).length === 0) {
            console.log("No information to update");
            return false;
        }

        // Update the document in Firestore
        await updateDoc(userDoc.ref, data);
        return true;
    } catch (error) {
        console.error("Error updating user information:", error);
        return false;
    }
};