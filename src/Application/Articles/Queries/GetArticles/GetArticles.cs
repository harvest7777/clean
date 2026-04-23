using clean.Application.Common.Interfaces;

namespace clean.Application.Articles.Queries.GetArticles;

public record GetArticlesQuery : IRequest<List<ArticleDto>>;

public class GetArticlesQueryHandler : IRequestHandler<GetArticlesQuery, List<ArticleDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetArticlesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ArticleDto>> Handle(GetArticlesQuery request, CancellationToken cancellationToken)
    {
        return await _context.ArticleItems
            .AsNoTracking()
            .ProjectTo<ArticleDto>(_mapper.ConfigurationProvider)
            .OrderBy(a => a.Title)
            .ToListAsync(cancellationToken);
    }
}
