// Window API types
declare global {
  interface Window {
    api: {
      // Generic invoke method
      invoke: (channel: string, ...args: any[]) => Promise<any>

      // Legacy methods
      getGitlab: (path: string) => Promise<any>
      gitlab: (path: string, type: string, data?: any) => Promise<any>
      wrike: (path: string, type: string, data?: any) => Promise<any>
      saveFile: (data: any) => Promise<any>
      getAppVersion: () => Promise<string>
      readExcelFile: () => Promise<any>
      gitlabWithHeaders: (path: string, type: string, data?: any) => Promise<any>
      checkSignIn: () => Promise<any>
      signOut: () => Promise<any>
      signinWithFirebaseEmail: (email: string, password: string) => Promise<any>
      changePassword: (email: string, password: string, newPassword: string) => Promise<any>
      getAllUsers: () => Promise<any>
      createNewUser: (email: string, password: string, role: string, name: string) => Promise<any>
      updateUserInformation: (data: { email: string; role: string; name: string }) => Promise<any>
      graphGet: (endpoint: string) => Promise<any>
      checkForAppUpdate: () => Promise<any>
      performAppUpdate: () => Promise<any>
    }
    electron: any
  }
}

export {}
