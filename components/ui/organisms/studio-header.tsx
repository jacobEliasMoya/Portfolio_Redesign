import Link from "next/link";

export function StudioHeader() {
  return <header className="studio-header"><Link className="wordmark" href="/" aria-label="Jacob Moya home">JM<span> / SPACE LAB</span></Link><span className="studio-label">DESIGN FOUNDATION · 001</span></header>;
}
