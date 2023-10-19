import {useParams} from "react-router-dom";
import React from "react";
import {Container} from "react-bootstrap";
import {Feed} from "../containers/Feed";
import {Api} from "../services/Api";

export function Profile({feedBulkSize}: {feedBulkSize: number}) {
    const {userid} = useParams()

    return (
        <Container className="main-content" style={{marginTop: 50}}>
            <h5>@{userid!}</h5>
            <Feed
                canCompose={false}
                feed={(continueFrom: string) => new Api().getUserFeed(userid!, feedBulkSize, continueFrom)}
                feedBulkSize={feedBulkSize}
                parentId={null}
            />

        </Container>
    )
}