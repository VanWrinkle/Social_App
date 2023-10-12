import React, {SyntheticEvent, useEffect, useState} from "react";
import {Crumb} from "../types/Crumb";
import {Api} from "../services/Api";
import {Button, Card, Col, Container, Row, Spinner, Stack} from "react-bootstrap";
import {SocialMediaTopPanel} from "./CrumbTopPanel";
import {Link} from "react-router-dom";
import {ThumbUp} from "@mui/icons-material";
import {useAuth} from "../context/AuthProvider";
import InfiniteScroll from 'react-infinite-scroll-component';
import {getTimeSince} from "../utils/utils";

export function CrumbsFeed(prop: {
    canCompose: boolean,
    feed: (continueFrom: string) => Promise<Crumb[] | undefined>
}) {
    const [crumbs, setCrumbs] = useState<Crumb[]>([])
    const [hasMore, setHasMore] = useState(true)

    async function updatePosts() {
        const continueFrom = crumbs.length > 0 ? crumbs[crumbs.length - 1].post_id : ""
        prop.feed(continueFrom)
            .then((response) => {
                if (response) {
                    if (response.length === 0) {
                        setHasMore(false)
                    } else {
                        setCrumbs([...crumbs, ...response])
                    }
                }
            })
            .catch(() => {
                // TODO error handling
            })
    }

    async function onLike(_e: SyntheticEvent, crumb: Crumb) {
        new Api().toggleLike(crumb)
            .then(() => {
                crumb.likes += crumb.liked ? -1 : 1
                crumb.liked = !crumb.liked
                setCrumbs(crumbs.map(it => {
                    return crumb.post_id === it.post_id ? crumb : it
                }))
            })
            .catch(() => {
                // TODO error handling
            })
    }

    useEffect(() => {
        void updatePosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container className="main-content">
            {prop.canCompose && (
                <Row>
                    <SocialMediaTopPanel crumbs={crumbs} setCrumbs={setCrumbs}/>
                </Row>
            )}
                <InfiniteScroll
                    next={updatePosts}
                    hasMore={hasMore}
                    loader={(
                        <Row className="justify-content-center mt-4">
                            <Spinner animation="border" variant="info" />
                        </Row>
                    )}
                    dataLength={crumbs.length}
                    className="overflow-hidden"
                >
                    <Row>
                        <SocialMediaPostsDisplayAllBrief crumbs={crumbs} onLike={onLike}/>
                    </Row>
                </InfiniteScroll>
        </Container>
    );
}



/**
 * panel that iterates over crumbs array and includes component for each
 * @param props
 */
export function SocialMediaPostsDisplayAllBrief(props: {crumbs: Crumb[], onLike: (e: SyntheticEvent, crumb: Crumb)=>{}}) {
    const results = props.crumbs.map((crumb) =>
        <SocialMediaPostDisplaySingleBrief crumb={crumb} onLike={props.onLike} />
    );
    return (
        <div>{results}</div>
    );
}

/**
 * component for a single crumb
 * @param props
 */
function SocialMediaPostDisplaySingleBrief(props: {crumb: Crumb, onLike: (e: SyntheticEvent, crumb: Crumb)=>{}}) {
    const auth = useAuth();
    const date = new Date(props.crumb.timestamp_milliseconds);
    const content = props.crumb.contents.map(content => {
        switch (content.type) {
            case "hashtag":
                return(<Link to={""} style={{color: "inherit"}}>{content.value}</Link>)
            case "mention":
                return(<Link to={`/profile/${content.value.substring(1)}`} style={{color: "inherit"}}>{content.value}</Link>)
            default:
                return (<>{content.value}</>)
        }
    })

    return (
        <Card className="mb-2">
            <Row>
                <Col xs={3}>
                    <Card.Img src="/logo192.png" />
                </Col>
                <Col>
                    <Card.Body>
                        <Row className="pb-2">
                            <Col sm={8} style={{color: 'black', fontSize: '1.2em'}}>@
                                <a href={`/profile/${props.crumb.author}`} style={{color: "inherit"}}>
                                    <em>{props.crumb.author}</em>
                                </a>
                            </Col>
                            <Col style={{textAlign: 'right'}}>
                                <em style={{color: 'gray', fontSize: '0.8em'}}>
                                    {getTimeSince(date)}
                                </em>
                            </Col>

                        </Row>
                        <Card.Text>{content}</Card.Text>
                        <Stack direction="horizontal">
                            <div className="ms-auto">
                                <Button
                                    size="sm"
                                    className="ms-auto"
                                    disabled={props.crumb.author === auth?.username}
                                    variant={props.crumb.liked ? "info" : "outline-info"}
                                    onClick={e => props.onLike(e, props.crumb)}>
                                    <span className="pe-1">
                                        <ThumbUp fontSize="inherit" />
                                    </span>
                                    {props.crumb.likes}
                                </Button>
                            </div>
                        </Stack>
                    </Card.Body>
                </Col>
            </Row>
        </Card>
    );
}
