/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Component } from "react";
import styles from "../styles/Home.module.css";
import road from "../public/road.svg";
import eye from "../public/eye.svg";
import defaultRoad from "../public/default.jpg";
import { ImageCard } from "../Components/ImageCard";
import moment from "moment";

type AbbeyImage = {
  image: string;
  date: Date;
  success: boolean;
  numberOfPeople?: number;
  confidence?: number;
};

type Props = {};

type State = {
  recent: AbbeyImage | null;
  past: AbbeyImage[];
};

export default class Home extends Component<Props, State> {
  updateIntervalId: NodeJS.Timer | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      recent: null,
      past: [],
    };
  }

  componentDidMount(): void {
    // Get Past Successful Images
    // TODO: GET /past for populating past occurances array
    let tempPast: AbbeyImage[] = [];
    for (let i = 9; i > 0; i--) {
      tempPast.push({
        date: new Date(`2022-10-1${i}`),
        image: defaultRoad.src,
        success: i % 2 == 0,
        confidence: i * 11,
      });
    }
    this.setState({ past: tempPast });

    // Get the most recently processed image
    this.updateMostRecent();

    // Continue to update the last processed image
    this.updateIntervalId = setInterval(this.updateMostRecent, 5 * 1000);
  }

  componentWillUnmount(): void {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
  }

  // Run every ~5 seconds to update the image that is currently being processed
  updateMostRecent = () => {
    // TODO: GET /recent for populating most recent entry
    this.setState({
      recent: { image: defaultRoad.src, date: new Date(), success: true },
    });
  };

  render() {
    const { recent, past } = this.state;
    return (
      <div>
        <Head>
          <title>AbbeyWatch</title>
          <meta
            name="description"
            content="A live view of recent Abbey Road poses."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className={styles.nav_container}>
          <img src={road.src} className={styles.title_icon} alt="logo icon" />
          <h1 className={styles.title}> AbbeyWatch </h1>
          <img src={eye.src} className={styles.title_icon} alt="logo icon" />
        </header>
        <main className={styles.content}>
          <div className={styles.left_pane}>
            <img
              src={recent ? recent.image : defaultRoad.src}
              alt="Currently Processing"
              className={styles.processing}
            />
            <div style={{ padding: "8px" }}>
              {recent ? (
                recent.success ? (
                  <p className={styles.success}>Success</p>
                ) : (
                  <p className={styles.fail}>Fail</p>
                )
              ) : (
                <div />
              )}
              <p className={styles.processing_label}>
                {recent
                  ? `Last image processed at ${moment(recent.date).format(
                      "dddd, MMMM Do YYYY, h:mm:ss a"
                    )}`
                  : ""}
              </p>
            </div>
          </div>
          <div className={styles.right_pane}>
            {past.map((p) => (
              <ImageCard
                key={p.date.toString()}
                image={defaultRoad.src}
                confidence={p.confidence!}
                date={p.date}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }
}
