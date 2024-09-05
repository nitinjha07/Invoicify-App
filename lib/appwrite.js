import { Client, ID, Account, Databases, Query } from "react-native-appwrite";
import {
  EXPO_PUBLIC_ENDPOINT as Endpoint,
  EXPO_PUBLIC_PLATFORM as Platform,
  EXPO_PUBLIC_PROJECTID as ProjectID,
  EXPO_PUBLIC_STORAGEID as StorageID,
  EXPO_PUBLIC_DATABASEID as DatabaseID,
  EXPO_PUBLIC_USERID as UserID,
} from "@env";

export const appwriteConfig = {
  endpoint: Endpoint,
  platform: Platform,
  projectId: ProjectID,
  storageId: StorageID,
  databaseId: DatabaseID,
  userCollectionId: UserID,
};

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error("Account creation failed");

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(`Create User Error: ${error.message}`);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(`Sign In Error: ${error.message}`);
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No current account");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("No user found");

    return currentUser.documents[0];
  } catch (error) {
    console.log(`Get Current User Error: ${error.message}`);
    return null;
  }
}

export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(`Sign Out Error: ${error.message}`);
  }
}
