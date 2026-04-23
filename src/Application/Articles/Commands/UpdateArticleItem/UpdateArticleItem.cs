using clean.Application.Common.Interfaces;
using clean.Domain.Enums;

namespace clean.Application.Articles.Commands.UpdateArticleItem;

public record UpdateArticleItemCommand : IRequest
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public string? Content { get; init; }

    public ArticleStatus Status { get; init; }
}

public class UpdateArticleItemCommandHandler : IRequestHandler<UpdateArticleItemCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateArticleItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateArticleItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ArticleItems
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Title = request.Title;
        entity.Content = request.Content;
        entity.Status = request.Status;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
