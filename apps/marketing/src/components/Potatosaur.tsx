// Function to draw the potatosaur illustration
export const Potatosaur = () => {
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Potatosaur body */}
      <path
        d="M220 180C220 180 250 130 220 100C190 70 150 80 120 90C90 100 80 120 60 160C40 200 60 220 80 240C100 260 140 270 180 250C220 230 220 180 220 180Z"
        stroke="black"
        strokeWidth="3"
        fill="white"
      />

      {/* Potatosaur neck and head */}
      <path
        d="M220 180C220 180 240 160 250 120C260 80 230 60 200 70"
        stroke="black"
        strokeWidth="3"
        fill="white"
      />

      {/* Potatosaur face */}
      <ellipse
        cx="250"
        cy="115"
        rx="12"
        ry="8"
        fill="white"
        stroke="black"
        strokeWidth="3"
      />
      <circle cx="253" cy="112" r="2" fill="black" />

      {/* Potatosaur legs */}
      <path d="M100 240L80 270" stroke="black" strokeWidth="3" />
      <path d="M140 250L130 280" stroke="black" strokeWidth="3" />
      <path d="M180 230L190 260" stroke="black" strokeWidth="3" />

      {/* Potatosaur tail */}
      <path d="M60 160C60 160 40 180 20 160" stroke="black" strokeWidth="3" />

      {/* Potatosaur spikes/plates with green color */}
      <path
        d="M220 100C220 100 230 85 225 70"
        stroke="black"
        strokeWidth="3"
        fill="#4ADE80"
      />
      <path
        d="M180 250C180 250 170 255 165 265"
        stroke="black"
        strokeWidth="3"
        fill="#4ADE80"
      />
      <ellipse
        cx="225"
        cy="70"
        rx="5"
        ry="6"
        fill="#4ADE80"
        stroke="black"
        strokeWidth="2"
      />
      <ellipse
        cx="165"
        cy="265"
        rx="5"
        ry="6"
        fill="#4ADE80"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  )
}
