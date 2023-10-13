import {Crumb, CrumbV1, SocialMediaPostDispatch} from "../types/Crumb";
import React, {SyntheticEvent, useContext, useState} from "react";
import {useAuth} from "../context/AuthProvider";
import {Api} from "../services/Api";
import {CrumbComposeForm} from "../components/CrumbComposeForm";
import {useAddNotification, useNotification} from "../context/AlertProvider";

/**
 * panel for composing new crumbs
 * @param props - array of crumbs and setter
 */
export function CrumbCompose(props: {crumbs: Crumb[], setCrumbs: SocialMediaPostDispatch}) {
    const [userInput, setUserInput] = useState("");
    const [spinner, setSpinner] = useState(false)
    const [alert, setAlert] = useState("")
    const username = useAuth()?.username
    const addNotify = useAddNotification()

    async function onSubmit(e: SyntheticEvent) {
        e.preventDefault();
        const timer = setTimeout(() => {
            setSpinner(true)
        }, 300)
        try {
            const api = new Api()
            const crumb = new CrumbV1(username!.toString(), userInput)
            // TODO: Remember to uncomment again!!!
            // await api.postNewCrumb(crumb);
            setUserInput("");
            addNotify({
                message: "new crumb posted successfully",
                link: ""})
            props.setCrumbs([crumb, ...props.crumbs]);

        } catch (error) {
            if (error instanceof Error) {
                setAlert(error.message)
            }
        } finally {
            clearTimeout(timer)
            setSpinner(false)

        }

    }

    return (
        <CrumbComposeForm
            userInput={userInput}
            username={username}
            spinner={spinner}
            setUserInput={setUserInput}
            onSubmit={onSubmit}
            setAlert={setAlert}
            alert={alert}
        />
    );
}