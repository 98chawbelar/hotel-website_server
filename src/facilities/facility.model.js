const mongoose = require("mongoose");
const slugify = require("slugify");

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    // store multiple local image paths
    images: [
      {
        type: String,
        required: true,
      },
    ],

    description: {
      type: String,
      required: true,
      maxlength: 1500,
    },

    link: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

// auto create slug

facilitySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

module.exports = mongoose.model("Facility", facilitySchema);
