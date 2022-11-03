/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { Component } from "react";
import styles from "../styles/Home.module.css";
import road from "../public/road.svg";
import eye from "../public/eye.svg";
import defaultRoad from "../public/default.jpg";
import { ImageCard } from "../Components/ImageCard";
import moment from "moment";
import { AbbeyImage } from "../types/AbbeyImage";
import axios from "axios";

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

    axios.get("/api/past").then((res) => {
      console.log(res.data.result);
      if (!res.data.error) {
        this.setState({
          past: res.data.result,
        });
      } else {
        this.setState({
          past: [],
        });
      }
    });

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
    axios.get("/api/recent").then((res) => {
      if (!res.data.error) {
        this.setState({
          recent: res.data.result,
        });
      } else {
        this.setState({
          recent: { image: defaultRoad.src, date: new Date(), success: true, confidence: 0 },
        });
      }
    });
  };

  render() {
    const { recent, past } = this.state;
    return (
      <div className={styles.full_page}>
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
                key={`${p.image}${p.date}`}
                image={p.image}
                confidence={p.confidence}
                date={p.date}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }
}
