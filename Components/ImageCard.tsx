/* eslint-disable @next/next/no-img-element */
import moment from "moment";
import styles from "../styles/ImageCard.module.css";

type Props = {
  image: string;
  date: Date;
  confidence: number;
};

export function ImageCard(props: Props) {
  console.log(props.image);
  return (
    <div className={styles.container}>
      <img src={props.image} alt="ImageCard" className={styles.image} />
      <div style={{ display: "flex", padding: "4px", justifyContent: "space-between" }}>
        <p className={styles.confidence}>{props.confidence}%</p>
        <p className={styles.date}>{moment(props.date).fromNow()}</p>
      </div>
    </div>
  );
}
