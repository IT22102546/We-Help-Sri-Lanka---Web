import React from "react";
import Slider from "react-slick";
import couple3 from '../assets/images/couple-3.jpg';
import customer from '../assets/images/couple-1.png';


const TestimonialCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="w-full flex justify-center py-10">
      <div className="max-w-4xl w-full px-4 min-h-[400px]">
        {" "}
        {/* Increase the height here */}
        <h2 className="text-center text-[50px] font-semibold font-Sacremento text-orange-500 mb-4">
          What They Say
        </h2>
        <Slider {...settings}>
          <div className="flex flex-col items-center text-center">
            <img
              src={customer}
              alt="Danial"
              className="w-24 h-24 rounded-full mb-4 mx-auto" // Added 'mx-auto' to center image horizontally
            />
            <h3 className="text-lg font-semibold text-gray-700">Danial</h3>
            <p className="text-gray-500 italic">
              "The service was exceptional! From start to finish, everything was
              seamless and enjoyable."
            </p>
          </div>
          {/* Add more slides */}
          <div className="flex flex-col items-center text-center">
            <img
              src={couple3}
              alt="Customer"
              className="w-24 h-24 rounded-full mb-4 mx-auto" // Added 'mx-auto' to center image horizontally
            />
            <h3 className="text-lg font-semibold text-gray-700">Alex</h3>
            <p className="text-gray-500 italic">
              "A very smooth experience with excellent communication
              throughout."
            </p>
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
