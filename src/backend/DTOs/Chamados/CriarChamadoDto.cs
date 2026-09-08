using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Chamados;

public class CriarChamadoDto
{
    [Required(ErrorMessage = "O título é obrigatório.")]
    [MinLength(5, ErrorMessage = "O título deve possuir no mínimo 5 caracteres.")]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição é obrigatória.")]
    public string Descricao { get; set; } = string.Empty;

    [Required(ErrorMessage = "A categoria é obrigatória.")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "O solicitante é obrigatório.")]
    public string Solicitante { get; set; } = string.Empty;
}