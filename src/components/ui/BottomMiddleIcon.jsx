export default function BottomMiddleIcon({ showEvent, setShowEvent }) {
  if (showEvent) {
    return null;
  }

  return (
    <div className="absolute bottom-5 right-[50%] z-[9999]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-arrow-bar-up cursor-pointer"
        viewBox="0 0 16 16"
        onClick={() => setShowEvent(true)}
      >
        <path
          fillRule="evenodd"
          d="M8 10a.5.5 0 0 0 .5-.5V3.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 3.707V9.5a.5.5 0 0 0 .5.5zm-7 2.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z"
        />
      </svg>
    </div>
  );
}
