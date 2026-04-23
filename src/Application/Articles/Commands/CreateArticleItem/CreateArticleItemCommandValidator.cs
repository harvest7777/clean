namespace clean.Application.Articles.Commands.CreateArticleItem;

public class CreateArticleItemCommandValidator : AbstractValidator<CreateArticleItemCommand>
{
    public CreateArticleItemCommandValidator()
    {
        RuleFor(v => v.Title)
            .MaximumLength(200)
            .NotEmpty();

        RuleFor(v => v.Content)
            .NotEmpty();
    }
}
