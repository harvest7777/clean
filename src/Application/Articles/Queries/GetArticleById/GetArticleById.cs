using clean.Application.Articles.Queries.GetArticles;
using clean.Application.Common.Interfaces;

namespace clean.Application.Articles.Queries.GetArticleById;

public record GetArticleByIdQuery(int Id) : IRequest<ArticleDto>;

public class GetArticleByIdQueryHandler : IRequestHandler<GetArticleByIdQuery, ArticleDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetArticleByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ArticleDto> Handle(GetArticleByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.ArticleItems
            .AsNoTracking()
            .ProjectTo<ArticleDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        return entity;
    }
}
