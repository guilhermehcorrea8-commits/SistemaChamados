using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Chamados;

public class AtualizarStatusDto
{
    [Required(ErrorMessage = "O status é obrigatório.")]
    public string Status { get; set; } = string.Empty;
}