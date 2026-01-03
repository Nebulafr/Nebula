// University logos
import type { StaticImageData } from "next/image";
import centraleSupelec from "./universities/centrale_supelec_logo.png";
import edhec from "./universities/edhec-logo.png";
import emlyon from "./universities/emlyon_logo.png";
import escp from "./universities/escp_logo.png";
import essec from "./universities/essec_logo.png";
import hecParis from "./universities/hec_paris_logo.png";

export const universityLogos = {
  centraleSupelec,
  edhec,
  emlyon,
  escp,
  essec,
  hecParis,
};

export interface UniversityLogo {
  name: string;
  url: StaticImageData;
}

export const universityLogosArray: UniversityLogo[] = [
  {
    name: "HEC Paris",
    url: hecParis,
  },
  {
    name: "ESSEC",
    url: essec,
  },
  {
    name: "ESCP",
    url: escp,
  },
  {
    name: "emlyon",
    url: emlyon,
  },
  {
    name: "EDHEC",
    url: edhec,
  },
  {
    name: "Centrale Supélec",
    url: centraleSupelec,
  },
];

export default universityLogos;