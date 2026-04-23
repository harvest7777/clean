using clean.Application.Common.Interfaces;
using clean.Domain.Enums;

namespace clean.Application.Articles.Commands.UpdateArticleItemDetail;

public record UpdateArticleItemDetailCommand : IRequest
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public string? Content { get; init; }

    public ArticleStatus? Status { get; init; }
}

public class UpdateArticleItemDetailCommandHandler : IRequestHandler<UpdateArticleItemDetailCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateArticleItemDetailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateArticleItemDetailCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ArticleItems
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (request.Title is not null) entity.Title = request.Title;
        if (request.Content is not null) entity.Content = request.Content;
        if (request.Status is not null) entity.Status = request.Status.Value;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
