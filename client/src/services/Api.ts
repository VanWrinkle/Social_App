import axios, {AxiosError, AxiosInstance} from "axios";
import {Crumb} from "../types/Crumb";
import {User} from "../types/User";

export class Api {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: '/api',
            timeout: 5000,
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    async userLogin(username: string, password: string) {
       try {
           const response = await this.client.post('/login', {
               username: username,
               password: password
           })
           return response.data
       } catch (error: any) {
           this.handleApiError(error, {401: 'Incorrect username and/or password'})
       }
    }

    async userLogout() {
        try {
            await this.client.post('/logout')
        } catch (error: any) {
            this.handleApiError(error, {})
        }
    }

    async userRenew() {
        try {
            const response = await this.client.post('/renew')
            return response.data
        } catch (error: any) {
            this.handleApiError(error, {401: 'Invalid token'})
        }
    }

    async userRegistration(username: string, password: string) {
        try {
            const response = await this.client.post('/register', {
                username: username,
                password: password
            })
            return response.data
        } catch (error: any) {
            this.handleApiError(error, {
                400: 'The username or password does not meet the security requirements',
                409: 'A user is already registered by that username'
            })
        }
    }

    async postNewCrumb(crumb: Crumb) {
        try {
            const response = await this.client.post('/postCrumb', crumb);
            return response.data;
        } catch (error: any) {
            this.handleApiError(error, {401: 'Not logged in'})
        }
    }

    async getMainFeed(numberOfPosts: number = 10, continue_from: string = "", parent: string | null = null) {
        try {
            const response = await this.client.get('/getMainFeed', {params: {
                    "max_posts": numberOfPosts,
                    "continue_from": continue_from,
                    "parent": parent
                }});
            return response.data as Crumb[];
        } catch (error: any) {
            this.handleApiError(error, {}) // TODO: Handle custom handler errors
        }
    }


    async getUserFeed(username: string, numberOfPosts: number = 10, continue_from: string = "") {
        try {
            const response = await this.client.get('/getUserFeed', {params: {
                    "user": username,
                    "max_posts": numberOfPosts,
                    "continue_from": continue_from
                }});
            return response.data as Crumb[];
        } catch (error: any) {
            this.handleApiError(error, {}) // TODO: Handle custom handler errors
        }
    }


    async toggleLike(crumb: Crumb) {
        try {
            if (crumb.liked) {
                await this.client.delete('/likeCrumb', {params: {'crumb': crumb.post_id}})
            } else {
                await this.client.post('/likeCrumb', {},{params: {'crumb': crumb.post_id}})
            }
        } catch (error: any) {
            this.handleApiError(error, {})
        }
    }

    async toggleFollow(userId: String, remove: boolean) {
        try {
            if (remove) {
                await this.client.delete('/followUser', {params: {'user': userId}})
            } else {
                await this.client.post('/followUser', {},{params: {'user': userId}})
            }
        } catch (error: any) {
            this.handleApiError(error, {})
        }
    }

    async userDeletion(username: string, password: string) {
        try {
            await this.userLogin(username, password)
            await this.client.delete('/deleteUser')
        } catch (error: any) {
            if (error.message === "Incorrect username and/or password") {
                throw new Error("Incorrect password provided")
            }
            console.log(error)
            this.handleApiError(error, {})
        }
    }

    async getProfileInfo(username: string) {
        try {
            const response = await this.client.get('/getProfileInfo', {params: {'profileOwner': username}})
            return response.data as User
        } catch (error: any) {
            this.handleApiError(error, {})
        }

    }

    private handleApiError(error: AxiosError, customErrorMessages: Record<number, string> = {}) {
        if (error.response) {
            const status = error.response.status;
            if (customErrorMessages[status]) {
                throw new Error(customErrorMessages[status]);
            } else {
                throw new Error('Unexpected server error, try again later');
            }
        } else if (error.request) {
            throw new Error('Network error or timeout');
        } else {
            throw new Error('Unexpected error');
        }
    }



}