using backend.Data;
using backend.DTOs.Chamados;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChamadosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChamadosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/chamados
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChamadoDto>>> GetChamados(
        [FromQuery] string? status)
    {
        var query = _context.Chamados.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.Status == status);
        }

        var chamados = await query
            .OrderByDescending(c => c.DataAbertura)
            .Select(c => new ChamadoDto
            {
                Id = c.Id,
                Titulo = c.Titulo,
                Descricao = c.Descricao,
                Categoria = c.Categoria,
                Status = c.Status,
                DataAbertura = c.DataAbertura,
                Solicitante = c.Solicitante
            })
            .ToListAsync();

        return Ok(chamados);
    }

    // POST: api/chamados
    [HttpPost]
    public async Task<ActionResult<ChamadoDto>> CriarChamado(
        CriarChamadoDto dto)
    {
        var categoriasValidas = Enum.GetNames<CategoriaChamado>();

        if (!categoriasValidas.Contains(dto.Categoria))
        {
            return BadRequest(new
            {
                mensagem = "Categoria inválida.",
                categoriasPermitidas = categoriasValidas
            });
        }

        var chamado = new Chamado
        {
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            Categoria = dto.Categoria,
            Status = "Pendente",
            DataAbertura = DateTime.Now,
            Solicitante = dto.Solicitante
        };

        _context.Chamados.Add(chamado);
        await _context.SaveChangesAsync();

        var resposta = new ChamadoDto
        {
            Id = chamado.Id,
            Titulo = chamado.Titulo,
            Descricao = chamado.Descricao,
            Categoria = chamado.Categoria,
            Status = chamado.Status,
            DataAbertura = chamado.DataAbertura,
            Solicitante = chamado.Solicitante
        };

        return CreatedAtAction(
            nameof(GetChamados),
            new { id = chamado.Id },
            resposta);
    }

    // PUT: api/chamados/{id}/status
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ChamadoDto>> AtualizarStatus(
        int id,
        AtualizarStatusDto dto)
    {
        var statusValidos = new[]
        {
            "Pendente",
            "Em Andamento",
            "Resolvido"
        };

        if (!statusValidos.Contains(dto.Status))
        {
            return BadRequest(new
            {
                mensagem = "Status inválido.",
                statusPermitidos = statusValidos
            });
        }

        var chamado = await _context.Chamados.FindAsync(id);

        if (chamado == null)
        {
            return NotFound(new
            {
                mensagem = "Chamado não encontrado."
            });
        }

        chamado.Status = dto.Status;

        await _context.SaveChangesAsync();

        var resposta = new ChamadoDto
        {
            Id = chamado.Id,
            Titulo = chamado.Titulo,
            Descricao = chamado.Descricao,
            Categoria = chamado.Categoria,
            Status = chamado.Status,
            DataAbertura = chamado.DataAbertura,
            Solicitante = chamado.Solicitante
        };

        return Ok(resposta);
    }

    // DELETE: api/chamados/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> ExcluirChamado(int id)
    {
        var chamado = await _context.Chamados.FindAsync(id);

        if (chamado == null)
        {
            return NotFound(new
            {
                mensagem = "Chamado não encontrado."
            });
        }

        _context.Chamados.Remove(chamado);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}