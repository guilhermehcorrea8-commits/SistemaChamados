namespace backend.DTOs.Chamados;

public class ChamadoDto
{
    public int Id { get; set; }

    public string Titulo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime DataAbertura { get; set; }

    public string Solicitante { get; set; } = string.Empty;
}