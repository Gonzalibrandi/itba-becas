const mongoose = require('mongoose');

const TIPOS = ['curso', 'beca'];
const MODALIDADES = ['presencial', 'virtual', 'hibrida'];

const urlValida = {
  validator: (valor) => !valor || /^https?:\/\/\S+$/i.test(valor),
  message: 'Debe ser una URL que empiece con http:// o https://',
};

// Campos que solo aplican a un tipo de publicación.
// Curso: modalidad, duracion. Beca: monto, requisitos.
const detallesSchema = new mongoose.Schema(
  {
    modalidad: {
      type: String,
      enum: { values: MODALIDADES, message: 'Modalidad inválida: {VALUE}' },
    },
    duracion: { type: String, trim: true, maxlength: 60 },
    monto: { type: Number, min: [0, 'El monto no puede ser negativo'] },
    requisitos: { type: [{ type: String, trim: true, maxlength: 200 }], default: undefined },
  },
  { _id: false }
);

const publicacionSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: [true, 'El tipo es obligatorio'],
      enum: { values: TIPOS, message: 'El tipo debe ser "curso" o "beca"' },
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [120, 'El título no puede superar los 120 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [2000, 'La descripción no puede superar los 2000 caracteres'],
    },
    institucion: {
      type: String,
      required: [true, 'La institución es obligatoria'],
      trim: true,
      maxlength: [120, 'La institución no puede superar los 120 caracteres'],
    },
    imagenUrl: { type: String, trim: true, validate: urlValida },
    enlace: { type: String, trim: true, validate: urlValida },
    categorias: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
      default: [],
    },
    fechaCierre: { type: Date },
    detalles: { type: detallesSchema, default: () => ({}) },
    publicado: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

publicacionSchema.index({ tipo: 1, publicado: 1, creadoEn: -1 });

const Publicacion = mongoose.model('Publicacion', publicacionSchema, 'publicaciones');

module.exports = { Publicacion, TIPOS, MODALIDADES };
