export default function VoiceBarsIcon({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="3.5"  y="10" width="2" height="4"  rx="1" fill="currentColor">
        <animate attributeName="y" values="10;7;10" dur="1.1s" begin="0s"   repeatCount="indefinite" />
        <animate attributeName="height" values="4;10;4" dur="1.1s" begin="0s"   repeatCount="indefinite" />
      </rect>
      <rect x="7.5"  y="6"  width="2" height="12" rx="1" fill="currentColor">
        <animate attributeName="y" values="6;9;6"   dur="1.1s" begin="0.15s" repeatCount="indefinite" />
        <animate attributeName="height" values="12;6;12" dur="1.1s" begin="0.15s" repeatCount="indefinite" />
      </rect>
      <rect x="11.5" y="4"  width="2" height="16" rx="1" fill="currentColor">
        <animate attributeName="y" values="4;8;4"   dur="1.1s" begin="0.3s"  repeatCount="indefinite" />
        <animate attributeName="height" values="16;8;16" dur="1.1s" begin="0.3s"  repeatCount="indefinite" />
      </rect>
      <rect x="15.5" y="6"  width="2" height="12" rx="1" fill="currentColor">
        <animate attributeName="y" values="6;10;6"  dur="1.1s" begin="0.45s" repeatCount="indefinite" />
        <animate attributeName="height" values="12;4;12" dur="1.1s" begin="0.45s" repeatCount="indefinite" />
      </rect>
      <rect x="19.5" y="9"  width="2" height="6"  rx="1" fill="currentColor">
        <animate attributeName="y" values="9;7;9"   dur="1.1s" begin="0.6s"  repeatCount="indefinite" />
        <animate attributeName="height" values="6;10;6"  dur="1.1s" begin="0.6s"  repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
