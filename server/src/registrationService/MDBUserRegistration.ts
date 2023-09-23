import {UserDatabase} from "../userDatabase/userDatabase";
import {UserRegistrationService} from "./userRegistrationService"

const usernameRequirements = RegExp("^(?=[a-z_]{4,30}$)");
const passwordRequirements = RegExp("^(?=.*[a-zA-Z])(?=.*\\d).{8,}");

class MDBUserRegistration implements UserRegistrationService{
    userPersistence: UserDatabase;
    constructor (persistence: UserDatabase) {
        this.userPersistence = persistence;
    }

    validateCredentialRequirements(username: string, password: string): boolean {
        const legalUsername: boolean = username.match(usernameRequirements) != null;
        const legalPassword: boolean = password.match(passwordRequirements) != null;
        return username !== password && legalUsername && legalPassword
    }

    validateUniqueUsername(username: string): boolean {
        return this.userPersistence.getUser(username) === undefined;
    }

    registerUser(userName: string, hash: string, salt: string): Promise<void> {
        return this.userPersistence.addUser({userName, hash, salt});
    }
}